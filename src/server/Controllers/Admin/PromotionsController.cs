using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// The promotions controller for admin operations,
/// allowing administrators to manage promotions in the system.
/// </summary>
[ApiController]
[Route("api/admin/promotions")]
[Authorize(Roles = RoleNames.Admin)]
public class PromotionsController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="PromotionsController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="currentUser">The current user service.</param>
    public PromotionsController(ElkaroDbContext db, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Retrieves a list of all promotions.
    /// </summary>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A list of promotions.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PromotionDto>>> List(CancellationToken ct)
    {
        var promotions = await _db.Promotions
            .Include(p => p.Categories).Include(p => p.Brands).Include(p => p.Clients)
            .AsSplitQuery()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return Ok(promotions.Select(ToDto).ToList());
    }

    /// <summary>
    /// Creates a new promotion in the system.
    /// </summary>
    /// <param name="request">The promotion creation request.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The created promotion.</returns>
    /// <exception cref="BadRequestException"></exception>
    [HttpPost]
    public async Task<ActionResult<PromotionDto>> Create(PromotionUpsertRequest request, CancellationToken ct)
    {
        if (request.EndsAt <= request.StartsAt)
        {
            throw new BadRequestException("Datumam 'endsAt' jābūt vēlākam par 'startsAt'.", "Nederīgs laika periods");
        }
        if (!TryParseDiscountType(request.DiscountType, out var discountType))
        {
            throw new BadRequestException("Izmantojiet 'percentage' vai 'fixed'.", "Nederīgs discountType");
        }

        var promotion = new Promotion
        {
            Name = request.Name,
            Description = request.Description,
            DiscountType = discountType,
            DiscountValue = request.DiscountValue,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            IsActive = request.IsActive,
            CreatedBy = _currentUser.UserId,
        };

        _db.Promotions.Add(promotion);
        await _db.SaveChangesAsync(ct);

        await SetScopeAsync(promotion.Id, request, ct);
        await _db.Entry(promotion).Collection(p => p.Categories).LoadAsync(ct);
        await _db.Entry(promotion).Collection(p => p.Brands).LoadAsync(ct);
        await _db.Entry(promotion).Collection(p => p.Clients).LoadAsync(ct);

        return CreatedAtAction(nameof(List), null, ToDto(promotion));
    }

    /// <summary>
    /// Updates an existing promotion in the system.
    /// </summary>
    /// <param name="id">The ID of the promotion to update.</param>
    /// <param name="request">The promotion update request.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>No content if the update is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="BadRequestException"></exception>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, PromotionUpsertRequest request, CancellationToken ct)
    {
        var promotion = await _db.Promotions
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (promotion is null)
        {
            throw new ResourceNotFoundException($"Akcija ar ID {id} nav atrasta.");
        }

        if (request.EndsAt <= request.StartsAt)
        {
            throw new BadRequestException("Datumam 'endsAt' jābūt vēlākam par 'startsAt'.", "Nederīgs laika periods");
        }

        if (!TryParseDiscountType(request.DiscountType, out var discountType))
        {
            throw new BadRequestException("Izmantojiet 'percentage' vai 'fixed'.", "Nederīgs discountType");
        }

        promotion.Name = request.Name;
        promotion.Description = request.Description;
        promotion.DiscountType = discountType;
        promotion.DiscountValue = request.DiscountValue;
        promotion.StartsAt = request.StartsAt;
        promotion.EndsAt = request.EndsAt;
        promotion.IsActive = request.IsActive;

        await _db.SaveChangesAsync(ct);
        await SetScopeAsync(promotion.Id, request, ct);

        return NoContent();
    }

    /// <summary>
    /// Deletes an existing promotion from the system.
    /// </summary>
    /// <param name="id">The ID of the promotion to delete.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>No content if the deletion is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
    {
        var promotion = await _db.Promotions.FirstOrDefaultAsync(p => p.Id == id, ct);

        if (promotion is null)
        {
            throw new ResourceNotFoundException($"Akcija ar ID {id} nav atrasta.");
        }

        _db.Promotions.Remove(promotion);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Updates the status (active/inactive) of an existing promotion.
    /// </summary>
    /// <param name="id">The ID of the promotion to update.</param>
    /// <param name="request">The request containing the new status.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>No content if the update is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> UpdateStatus(long id, PromotionStatusUpdateRequest request, CancellationToken ct)
    {
        var promotion = await _db.Promotions.FirstOrDefaultAsync(p => p.Id == id, ct);

        if (promotion is null)
        {
            throw new ResourceNotFoundException($"Akcija ar ID {id} nav atrasta.");
        }

        promotion.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Sets the scope of a promotion by updating its associated categories, brands, and clients.
    /// </summary>
    /// <param name="promotionId">The ID of the promotion to update the scope for.</param>
    /// <param name="request">The request containing the new scope details.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>No content if the update is successful.</returns>
    private async Task SetScopeAsync(long promotionId, PromotionUpsertRequest request, CancellationToken ct)
    {
        _db.PromotionCategories.RemoveRange(_db.PromotionCategories.Where(x => x.PromotionId == promotionId));
        _db.PromotionBrands.RemoveRange(_db.PromotionBrands.Where(x => x.PromotionId == promotionId));
        _db.PromotionClients.RemoveRange(_db.PromotionClients.Where(x => x.PromotionId == promotionId));

        await _db.SaveChangesAsync(ct);

        foreach (var categoryId in request.CategoryIds.Distinct())
        {
            _db.PromotionCategories.Add(new PromotionCategory { PromotionId = promotionId, CategoryId = categoryId });
        }

        foreach (var brandId in request.BrandIds.Distinct())
        {
            _db.PromotionBrands.Add(new PromotionBrand { PromotionId = promotionId, BrandId = brandId });
        }

        foreach (var userId in request.ClientUserIds.Distinct())
        {
            _db.PromotionClients.Add(new PromotionClient { PromotionId = promotionId, UserId = userId });
        }

        await _db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Tries to parse a string representation of a discount type into the corresponding <see cref="DiscountType"/> enum value.
    /// </summary>
    /// <param name="raw">The raw string representation of the discount type.</param>
    /// <param name="type">When this method returns, contains the parsed <see cref="DiscountType"/> value if the parsing succeeded, or the default value if it failed.</param>
    /// <returns><c>true</c> if the parsing succeeded; otherwise, <c>false</c>.</returns>
    private static bool TryParseDiscountType(string raw, out DiscountType type)
    {
        switch (raw.Trim().ToLowerInvariant())
        {
            case "percentage": type = DiscountType.Percentage; return true;
            case "fixed": type = DiscountType.FixedAmount; return true;
            default: type = default; return false;
        }
    }

    /// <summary>
    /// Converts a <see cref="Promotion"/> entity to a <see cref="PromotionDto"/>.
    /// </summary>
    /// <param name="p">The <see cref="Promotion"/> entity to convert.</param>
    /// <returns>The corresponding <see cref="PromotionDto"/>.</returns>
    internal static PromotionDto ToDto(Promotion p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.DiscountType == DiscountType.Percentage ? "percentage" : "fixed",
        p.DiscountValue,
        p.StartsAt,
        p.EndsAt,
        p.IsActive,
        p.Categories
            .Select(c => c.CategoryId)
            .ToList(),
        p.Brands
            .Select(b => b.BrandId)
            .ToList(),
        p.Clients
            .Select(c => c.UserId)
            .ToList()
    );
}
