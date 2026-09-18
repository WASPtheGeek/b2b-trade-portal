using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers;

/// <summary>
/// The wishlist controller for managing the current user's saved products.
/// </summary>
[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IPricingService _pricing;

    /// <summary>
    /// Initializes a new instance of the <see cref="WishlistController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="currentUser">The current user service.</param>
    /// <param name="pricing">The pricing service.</param>
    public WishlistController(ElkaroDbContext db, ICurrentUserService currentUser, IPricingService pricing)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
        _pricing = Guard.Against.Null(pricing, nameof(pricing));
    }

    /// <summary>
    /// Gets the currently authenticated user's wishlisted products, most recently added first.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The wishlisted products.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> List(CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;

        var products = await _db.WishlistItems
            .Include(w => w.Product).ThenInclude(p => p.Brand)
            .Include(w => w.Product).ThenInclude(p => p.Images)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => w.Product)
            .ToListAsync(ct);

        var prices = await _pricing.ResolveUnitPricesAsync(products, userId, ct);

        return Ok(products.Select(p => ProductsController.ToListItemDto(p, prices[p.Id], includePrices: true)).ToList());
    }

    /// <summary>
    /// Gets the product IDs the currently authenticated user has wishlisted - a lightweight
    /// alternative to <see cref="List"/> for pages that only need to know which of the products
    /// they're already showing are saved (e.g. to light up a heart icon on a product tile).
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The wishlisted product IDs.</returns>
    [HttpGet("ids")]
    public async Task<ActionResult<IReadOnlyList<long>>> ListIds(CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;

        var ids = await _db.WishlistItems
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync(ct);

        return Ok(ids);
    }

    /// <summary>
    /// Adds a product to the currently authenticated user's wishlist. Adding an already-saved
    /// product is a no-op rather than an error, so the client can call this unconditionally.
    /// </summary>
    /// <param name="productId">The ID of the product to save.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPost("{productId:long}")]
    public async Task<IActionResult> Add(long productId, CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;

        var alreadySaved = await _db.WishlistItems
            .AnyAsync(w => w.UserId == userId && w.ProductId == productId, ct);

        if (alreadySaved)
        {
            return NoContent();
        }

        var productExists = await _db.Products.AnyAsync(p => p.Id == productId, ct);

        if (!productExists)
        {
            throw new ResourceNotFoundException($"Produkts ar ID {productId} nav atrasts.");
        }

        _db.WishlistItems.Add(new WishlistItem { UserId = userId, ProductId = productId });
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Removes a product from the currently authenticated user's wishlist. Removing a product
    /// that isn't saved is a no-op rather than an error, so the client can call this
    /// unconditionally.
    /// </summary>
    /// <param name="productId">The ID of the product to remove.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{productId:long}")]
    public async Task<IActionResult> Remove(long productId, CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;

        var item = await _db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId, ct);

        if (item is not null)
        {
            _db.WishlistItems.Remove(item);
            await _db.SaveChangesAsync(ct);
        }

        return NoContent();
    }
}
