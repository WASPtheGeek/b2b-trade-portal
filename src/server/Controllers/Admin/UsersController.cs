using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// Admin controller for managing users.
/// </summary>
[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = RoleNames.Admin)]
public class UsersController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="UsersController"/> class.
    /// </summary>
    /// <param name="db">The database context instance.</param>
    /// <param name="currentUser">The current user service instance.</param>
    public UsersController(ElkaroDbContext db, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Lists users with optional filtering by status and pagination.
    /// </summary>
    /// <param name="status">The status to filter users by.</param>
    /// <param name="paging">The paging query parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The list of users matching the criteria.</returns>
    /// <exception cref="BadRequestException"></exception>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> List(
        [FromQuery] string? status,
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        var query = _db.Users.Include(u => u.Role).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<UserStatus>(status, ignoreCase: true, out var parsed))
            {
                throw new BadRequestException($"'{status}' nav derīgs lietotāja statuss.", "Nederīgs statuss");
            }

            query = query.Where(u => u.Status == parsed);
        }

        var total = await query.CountAsync(ct);

        // Add the total count to the response headers for pagination purposes
        Response.Headers["X-Total-Count"] = total.ToString();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(ct);

        return Ok(users.Select(AuthController.ToDto).ToList());
    }

    /// <summary>
    /// Gets a user by their ID.
    /// </summary>
    /// <param name="id">The ID of the user to retrieve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The user matching the specified ID.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserDto>> Get(long id, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        return user is null
            ? throw new ResourceNotFoundException($"Lietotājs ar ID {id} nav atrasts.")
            : Ok(AuthController.ToDto(user));
    }

    /// <summary>
    /// Approves a user by their ID, changing their status to Approved.
    /// </summary>
    /// <param name="id">The ID of the user to approve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPost("{id:long}/approve")]
    public async Task<IActionResult> Approve(long id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) throw new ResourceNotFoundException($"Lietotājs ar ID {id} nav atrasts.");

        user.Status = UserStatus.Approved;
        user.ApprovedBy = _currentUser.UserId;
        user.ApprovedAt = DateTimeOffset.UtcNow;
        user.RejectionReason = null;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Rejects a user by their ID, changing their status to Rejected and recording the reason for rejection.
    /// </summary>
    /// <param name="id">The ID of the user to reject.</param>
    /// <param name="request">The rejection request containing the reason for rejection.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPost("{id:long}/reject")]
    public async Task<IActionResult> Reject(long id, RejectUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null)
        {
            throw new ResourceNotFoundException($"Lietotājs ar ID {id} nav atrasts.");
        }

        user.Status = UserStatus.Rejected;
        user.RejectionReason = request.Reason;
        user.ApprovedBy = _currentUser.UserId;
        user.ApprovedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Suspends a user by their ID, changing their status to Suspended.
    /// </summary>
    /// <param name="id">The ID of the user to suspend.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPost("{id:long}/suspend")]
    public async Task<IActionResult> Suspend(long id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null)
        {
            throw new ResourceNotFoundException($"Lietotājs ar ID {id} nav atrasts.");
        }

        user.Status = UserStatus.Suspended;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Reactivates a suspended user by their ID, changing their status back to Approved.
    /// </summary>
    /// <param name="id">The ID of the user to reactivate.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="BadRequestException"></exception>
    [HttpPost("{id:long}/reactivate")]
    public async Task<IActionResult> Reactivate(long id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null)
        {
            throw new ResourceNotFoundException($"Lietotājs ar ID {id} nav atrasts.");
        }

        if (user.Status != UserStatus.Suspended)
        {
            throw new BadRequestException("Tikai apturētu kontu var atkārtoti aktivizēt.", "Nederīga statusa maiņa");
        }

        user.Status = UserStatus.Approved;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
