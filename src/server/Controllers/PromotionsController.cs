using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers;

/// <summary>
/// Controller for managing promotions, accessible to authenticated users.
/// </summary>
[ApiController]
[Route("api/promotions")]
[Authorize]
public class PromotionsController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="PromotionsController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="currentUser">The service for accessing the current user's information.</param>
    public PromotionsController(ElkaroDbContext db, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Gets the list of currently active promotions for the authenticated user's business account.
    /// </summary>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A list of active promotions.</returns>
    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<PromotionDto>>> Active(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var userId = _currentUser.UserId;

        var promotions = await _db.Promotions
            .Include(p => p.Categories).Include(p => p.Brands).Include(p => p.Clients)
            .AsSplitQuery()
            .Where(p => p.IsActive && p.StartsAt <= now && p.EndsAt >= now)
            .Where(p => p.Clients.Count == 0 || p.Clients.Any(c => c.UserId == userId))
            .OrderBy(p => p.EndsAt)
            .ToListAsync(ct);

        return Ok(promotions.Select(Admin.PromotionsController.ToDto).ToList());
    }
}
