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
/// Controller for categories.
/// </summary>
[ApiController]
[Route("api/categories")]
[AllowAnonymous]
public class CategoriesController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="CategoriesController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="currentUser">The current user service.</param>
    public CategoriesController(ElkaroDbContext db, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Gets the flat list of categories that are visible in the menu.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of categories.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> List(CancellationToken ct)
    {
        var categories = await _db.Categories
            .Where(c => c.ShowInMenu)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);

        return Ok(categories.Select(ToDto).ToList());
    }

    /// <summary>
    /// Gets a category by its slug.
    /// </summary>
    /// <param name="slug">The slug of the category.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The category matching the slug.</returns>
    [HttpGet("{slug}")]
    public async Task<ActionResult<CategoryDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, ct);

        return category is null
            ? throw new ResourceNotFoundException($"Kategorija ar slug '{slug}' nav atrasta.")
            : Ok(ToDto(category));
    }

    /// <summary>
    /// Gets the list of products for a given category slug, with optional paging and pricing information.
    /// </summary>
    /// <param name="slug">The slug of the category.</param>
    /// <param name="paging">Paging information.</param>
    /// <param name="pricing">Pricing service.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of products in the category.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("{slug}/products")]
    public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> GetProducts(
        string slug, [FromQuery] PagingQuery paging,
        [FromServices] IPricingService pricing,
        CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, ct);

        if (category is null)
        {
            throw new ResourceNotFoundException($"Kategorija '{slug}' nav atrasta.");
        }

        var query = _db.Products
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.ProductCategories.Any(pc => pc.CategoryId == category.Id));

        var total = await query.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var products = await query
            .OrderBy(p => p.Name)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(ct);

        var prices = await pricing.ResolveUnitPricesAsync(products, _currentUser.UserId, ct);
        var includePrices = _currentUser.IsAuthenticated;

        return Ok(products.Select(p => ProductsController.ToListItemDto(p, prices[p.Id], includePrices)).ToList());
    }

    /// <summary>
    /// Converts a <see cref="Category"/> entity to a <see cref="CategoryDto"/>.
    /// </summary>
    /// <param name="c">The category entity to convert.</param>
    /// <returns>The corresponding category DTO.</returns>
    internal static CategoryDto ToDto(Category c) =>
        new(c.Id, c.ParentId, c.Name, c.Slug, c.Description, c.SortOrder, c.IsCustom, c.ShowInMenu);
}
