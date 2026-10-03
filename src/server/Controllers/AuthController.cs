using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Elkaro.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers;

/// <summary>
/// Auth controller that implements the self-register-then-admin-approves flow for business users.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="passwordHasher">The password hasher.</param>
    /// <param name="jwt">The JWT token service.</param>
    /// <param name="currentUser">The current user service.</param>
    public AuthController(ElkaroDbContext db, PasswordHasher<User> passwordHasher, IJwtTokenService jwt, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _passwordHasher = Guard.Against.Null(passwordHasher, nameof(passwordHasher));
        _jwt = Guard.Against.Null(jwt, nameof(jwt));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="request">The registration request.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A response indicating the result of the registration.</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        Guard.Against.Null(request, nameof(request));

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail, ct))
        {
            throw new ConflictException("Konts ar šo e-pasta adresi jau pastāv.", "E-pasts jau reģistrēts");
        }

        var businessRoleId = await _db.Roles
            .Where(r => r.Name == UserRole.Business.ToRoleName())
            .Select(r => r.Id)
            .FirstOrDefaultAsync(ct);

        if (businessRoleId == 0)
        {
            throw new InternalServerException("Loma 'business' nav inicializēta — vispirms jāizpilda shēmas 9. sadaļas sākotnējie dati.");
        }

        var user = new User
        {
            RoleId = businessRoleId,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            BusinessName = request.BusinessName.Trim(),
            RegistrationNumber = request.RegistrationNumber.Trim(),
            // VatNumber is optional on the form (not every business is a VAT payer), but the
            // database still requires a non-null value for business accounts (see
            // enforce_business_required_fields() in b2b_ecommerce_schema.sql) - falling back
            // to the registration number keeps that constraint satisfied without asking the
            // user for a number that may not exist.
            VatNumber = string.IsNullOrWhiteSpace(request.VatNumber) ? request.RegistrationNumber.Trim() : request.VatNumber.Trim(),
            IsVatExempt = true,
            Phone = request.Phone,
            Status = UserStatus.Pending,
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        // Inserting here fires trg_notify_admin_on_registration, which
        // enqueues a notification_log row per admin.
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(
            nameof(Me),
            null,
            new RegisterResponse("Reģistrācija saņemta — administrators izskatīs jūsu kontu.", user.Id, nameof(UserStatus.Pending))
        );
    }

    /// <summary>
    /// Implements the user login.
    /// </summary>
    /// <param name="request">The login request.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A response indicating the result of the login.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

        if (user is null || _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Nepareizs e-pasts vai parole.");
        }

        // Suspended is the one status that blocks login outright - an admin actively cut off
        // access, as opposed to Pending/Rejected, which are just points in the review flow.
        // Pending and Rejected accounts can sign in with restricted access (no prices,
        // ordering, see ICurrentUserService.IsApproved) and see their own status/reason.
        if (user.Status == UserStatus.Suspended)
        {
            throw new ForbiddenException("Jūsu konts ir apturēts. Lūdzu, sazinieties ar atbalsta dienestu.");
        }

        if (!UserRoleExtensions.TryParseRoleName(user.Role.Name, out var role))
        {
            throw new InternalServerException($"Nezināma lietotāja loma '{user.Role.Name}'.");
        }

        var token = _jwt.CreateAccessToken(user, role);

        return Ok(new LoginResponse(token, ToDto(user)));
    }

    /// <summary>
    /// Retrieves the details of the currently authenticated user.
    /// </summary>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The details of the currently authenticated user.</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct)
    {
        var userId = _currentUser.UserId;

        if (userId is null)
        {
            throw new UnauthorizedException("Nav autentificēts.");
        }

        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
        {
            throw new ResourceNotFoundException($"Lietotājs {userId} nav atrasts.");
        }

        return Ok(ToDto(user));
    }

    /// <summary>
    /// Updates the currently authenticated user's own profile (business/contact details -
    /// not email or password, see <see cref="UpdateProfileRequest"/>). If the account was
    /// Rejected, updating it counts as a resubmission: the status resets to Pending, the
    /// rejection reason is cleared, and admins are notified again, exactly as on first
    /// registration - a Rejected account otherwise has no other way back into the review queue.
    /// </summary>
    /// <param name="request">The updated profile fields.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The updated user.</returns>
    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;

        if (userId is null)
        {
            throw new UnauthorizedException("Nav autentificēts.");
        }

        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
        {
            throw new ResourceNotFoundException($"Lietotājs {userId} nav atrasts.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.BusinessName = request.BusinessName.Trim();
        user.RegistrationNumber = request.RegistrationNumber.Trim();
        user.VatNumber = string.IsNullOrWhiteSpace(request.VatNumber) ? request.RegistrationNumber.Trim() : request.VatNumber.Trim();
        user.Phone = request.Phone;

        var wasRejected = user.Status == UserStatus.Rejected;

        if (wasRejected)
        {
            user.Status = UserStatus.Pending;
            user.RejectionReason = null;
            user.ApprovedBy = null;
            user.ApprovedAt = null;
        }

        await _db.SaveChangesAsync(ct);

        if (wasRejected)
        {
            await EnqueueResubmissionNotificationAsync(user, ct);
        }

        return Ok(ToDto(user));
    }

    /// <summary>
    /// Converts a <see cref="User"/> entity to a <see cref="UserDto"/>.
    /// </summary>
    /// <param name="user">The user entity to convert.</param>
    /// <returns>The corresponding <see cref="UserDto"/>.</returns>
    internal static UserDto ToDto(User user) => new(
        user.Id, user.FirstName, user.LastName, user.Email,
        user.BusinessName, user.RegistrationNumber, user.VatNumber, user.Phone, user.IsVatExempt,
        user.Role?.Name ?? "", user.Status.ToString(), user.CreatedAt, user.RejectionReason);

    /// <summary>
    /// Enqueues an admin-alert notification for every admin when a previously-Rejected
    /// account resubmits (via <see cref="UpdateProfile"/>). Mirrors
    /// enqueue_business_registration_notification()'s per-admin fan-out in
    /// b2b_ecommerce_schema.sql, since that trigger only fires on INSERT and this is an
    /// UPDATE - reuses the same notification type, since it's the same "review this
    /// application" alert to the same audience.
    /// </summary>
    /// <param name="user">The resubmitting user.</param>
    /// <param name="ct">The cancellation token.</param>
    private async Task EnqueueResubmissionNotificationAsync(User user, CancellationToken ct)
    {
        var adminEmails = await _db.Users
            .Where(u => u.Role.Name == UserRole.Admin.ToRoleName())
            .Select(u => u.Email)
            .ToListAsync(ct);

        foreach (var adminEmail in adminEmails)
        {
            _db.NotificationLogs.Add(new NotificationLog
            {
                NotificationType = NotificationTypes.BusinessRegistrationRequest,
                RecipientEmail = adminEmail,
                RelatedUserId = user.Id,
            });
        }

        if (adminEmails.Count > 0)
        {
            await _db.SaveChangesAsync(ct);
        }
    }
}
