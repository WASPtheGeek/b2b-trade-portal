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
/// The products controller for public operations, allowing users to browse and view product details.
/// </summary>
[ApiController]
[Route("api/products")]
[AllowAnonymous]
public class ProductsController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly IPricingService _pricing;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="ProductsController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="pricing">The pricing service.</param>
    /// <param name="currentUser">The current user service.</param>
    public ProductsController(ElkaroDbContext db, IPricingService pricing, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _pricing = Guard.Against.Null(pricing, nameof(pricing));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Gets a paginated list of products, optionally filtered by category, brand, or search term.
    /// Prices are only included if the user is authenticated.
    /// Never rely on the client to hide a price that's already in the payload.
    /// </summary>
    /// <param name="category">Optional category slug or ID to filter products by.</param>
    /// <param name="brand">Optional brand ID to filter products by.</param>
    /// <param name="search">Optional search term to filter products by name or EAN.</param>
    /// <param name="paging">Paging parameters (page number and page size).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A paginated list of products matching the specified filters.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> List(
        [FromQuery] string? category,
        [FromQuery] long? brand,
        [FromQuery] string? search,
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        var query = _db.Products
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.ProductCategories.Any(pc =>
                pc.Category.Slug == category || pc.CategoryId.ToString() == category));
        }

        if (brand is not null)
        {
            query = query.Where(p => p.BrandId == brand);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{term}%") || (p.Ean != null && p.Ean == term));
        }

        var total = await query.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var products = await query
            .OrderBy(p => p.Name)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(ct);

        var includePrices = _currentUser.IsAuthenticated;
        var prices = await _pricing.ResolveUnitPricesAsync(products, _currentUser.UserId, ct);

        return Ok(products.Select(p => ToListItemDto(p, prices[p.Id], includePrices)).ToList());
    }

    /// <summary>
    /// Gets the details of a specific product by its ID.
    /// Prices are only included if the user is authenticated.
    /// Never rely on the client to hide a price that's already in the payload.
    /// </summary>
    /// <param name="id">The ID of the product.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The details of the specified product.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(long id, CancellationToken ct)
    {
        var product = await LoadForDetailAsync(p => p.Id == id, ct);

        return product is null
            ? throw new ResourceNotFoundException($"Produkts ar ID {id} nav atrasts.")
            : Ok(await ToDetailDtoAsync(product, ct));
    }

    /// <summary>
    /// Gets the details of a specific product by its EAN (European Article Number).
    /// Prices are only included if the user is authenticated.
    /// Never rely on the client to hide a price that's already in the payload.
    /// </summary>
    /// <param name="ean">The EAN of the product.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The details of the specified product.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("by-ean/{ean}")]
    public async Task<ActionResult<ProductDetailDto>> GetByEan(string ean, CancellationToken ct)
    {
        var product = await LoadForDetailAsync(p => p.Ean == ean, ct);

        return product is null
            ? throw new ResourceNotFoundException($"Produkts ar EAN '{ean}' nav atrasts.")
            : Ok(await ToDetailDtoAsync(product, ct));
    }

    /// <summary>
    /// Loads a product with all necessary related data for detailed view.
    /// </summary>
    /// <param name="predicate">The condition to find the product.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The product matching the specified condition, or null if not found.</returns>
    private Task<Product?> LoadForDetailAsync(
        System.Linq.Expressions.Expression<Func<Product, bool>> predicate,
        CancellationToken ct) =>
        _db.Products
            .Include(p => p.Brand)
            .Include(p => p.VatRate)
            .Include(p => p.Images)
            .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
            .Include(p => p.AttributeValues).ThenInclude(av => av.AttributeDefinition)
            .AsSplitQuery()
            .Where(p => p.IsActive)
            .FirstOrDefaultAsync(predicate, ct);

    /// <summary>
    /// Converts a <see cref="Product"/> entity to a <see cref="ProductDetailDto"/> for detailed view.
    /// Prices are only included if the user is authenticated.
    /// Never rely on the client to hide a price that's already in the payload.
    /// </summary>
    /// <param name="p">The product entity to convert.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The detailed DTO representation of the product.</returns>
    private async Task<ProductDetailDto> ToDetailDtoAsync(Product p, CancellationToken ct)
    {
        var includePrices = _currentUser.IsAuthenticated;
        var price = await _pricing.ResolveUnitPriceAsync(p, _currentUser.UserId, ct);

        return new ProductDetailDto(
            p.Id,
            p.Sku,
            p.Name,
            p.Description,
            p.Ean,
            p.Brand?.Name,
            p.IsActive,
            includePrices ? price.UnitPrice : null,
            p.VatRate.Rate,
            BuildPackagingOptions(p, price.UnitPrice, includePrices),
            p.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => i.Filename)
                .ToList(),
            p.ProductCategories
                .Select(pc => CategoriesController.ToDto(pc.Category))
                .ToList(),
            p.AttributeValues
                .ToDictionary(av => av.AttributeDefinition.Name, av => av.ValueText));
    }

    /// <summary>
    /// Converts a <see cref="Product"/> entity to a <see cref="ProductListItemDto"/> for listing view.
    /// Prices are only included if the user is authenticated.
    /// Never rely on the client to hide a price that's already in the payload.
    /// </summary>
    /// <param name="p">The product entity to convert.</param>
    /// <param name="price">The resolved price of the product.</param>
    /// <param name="includePrices">Whether to include prices in the DTO.</param>
    /// <returns>The list item DTO representation of the product.</returns>
    internal static ProductListItemDto ToListItemDto(Product p, ResolvedPrice price, bool includePrices) => new(
        p.Id,
        p.Sku,
        p.Name,
        p.Ean,
        p.Brand?.Name,
        p.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => i.Filename)
            .FirstOrDefault(),
        p.IsActive,
        includePrices ? price.UnitPrice : null,
        BuildPackagingOptions(p, price.UnitPrice, includePrices));

    /// <summary>
    /// Builds a list of packaging options for a product.
    /// </summary>
    /// <param name="p">The product entity.</param>
    /// <param name="resolvedPiecePrice">The resolved price per piece of the product.</param>
    /// <param name="includePrices">Whether to include prices in the packaging options.</param>
    /// <returns>A list of packaging options for the product.</returns>
    private static List<ProductPackagingOptionDto> BuildPackagingOptions(
        Product p,
        decimal resolvedPiecePrice,
        bool includePrices)
    {
        var options = new List<ProductPackagingOptionDto>();

        if (p.SoldByPiece)
        {
            options.Add(new ProductPackagingOptionDto("piece", 1, includePrices ? resolvedPiecePrice : null));
        }

        if (p.PiecesPerPackage is > 0)
        {
            options.Add(new ProductPackagingOptionDto(
                "package",
                p.PiecesPerPackage.Value,
                includePrices ? Math.Round(resolvedPiecePrice * p.PiecesPerPackage.Value, 2) : null
            ));
        }

        if (p.PiecesPerBox is > 0)
        {
            options.Add(new ProductPackagingOptionDto(
                "box",
                p.PiecesPerBox.Value,
                includePrices ? Math.Round(resolvedPiecePrice * p.PiecesPerBox.Value, 2) : null
            ));
        }

        return options;
    }
}
