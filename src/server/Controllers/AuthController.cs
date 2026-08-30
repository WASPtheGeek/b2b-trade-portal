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
            return Conflict(MakeProblem(
                title: "E-pasts jau reģistrēts",
                detail: "Konts ar šo e-pasta adresi jau pastāv.",
                statusCode: StatusCodes.Status409Conflict));
        }

        var businessRoleId = await _db.Roles
            .Where(r => r.Name == RoleNames.Business)
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
            VatNumber = request.VatNumber.Trim(),
            IsVatExempt = true,
            Phone = request.Phone,
            Status = UserStatus.Pending,
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        // Inserting here fires trg_notify_admin_on_registration, which
        // enqueues a notification_log row per admin
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(
            nameof(Me),
            null,
            new RegisterResponse(
                "Reģistrācija saņemta — administrators izskatīs jūsu kontu.",
                user.Id,
                nameof(UserStatus.Pending)
            )
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

        if (user.Status != UserStatus.Approved)
        {
            var detail = user.Status switch
            {
                UserStatus.Pending => "Jūsu konts gaida administratora apstiprinājumu.",
                UserStatus.Rejected => "Jūsu konta pieteikums netika apstiprināts.",
                UserStatus.Suspended => "Jūsu konts ir apturēts. Lūdzu, sazinieties ar atbalsta dienestu.",
                _ => "Jūsu konts pašlaik nevar pieslēgties.",
            };

            throw new ForbiddenException(detail);
        }

        var token = _jwt.CreateAccessToken(user, user.Role.Name);

        return Ok(new LoginResponse(token, ToDto(user)));
    }

    /// <summary>
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
            return Unauthorized();
        }

        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
        {
            throw new ResourceNotFoundException($"Lietotājs {userId} nav atrasts.");
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
        user.Role?.Name ?? "", user.Status.ToString(), user.CreatedAt);

    /// <summary>
    /// Creates a <see cref="ProblemDetails"/> object with the specified details.
    /// </summary>
    /// <param name="detail">The detail message of the problem.</param>
    /// <param name="title">The title of the problem.</param>
    /// <param name="statusCode">The HTTP status code of the problem.</param>
    /// <returns>A <see cref="ProblemDetails"/> object representing the problem.</returns>
    private static ProblemDetails MakeProblem(string detail, string? title = null, int statusCode = 400) => new()
    {
        Title = title ?? "Pieprasījums neizdevās",
        Detail = detail,
        Status = statusCode,
    };
}
