using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Services;

/// <summary>
/// Service for resolving product prices based on active promotions and user eligibility.
/// </summary>
public class PricingService : IPricingService
{
    private readonly ElkaroDbContext _db;

    /// <summary>
    /// Initializes a new instance of the <see cref="PricingService"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    public PricingService(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <inheritdoc/>
    public async Task<ResolvedPrice> ResolveUnitPriceAsync(
        Product product,
        long? userId,
        CancellationToken ct = default)
    {
        var prices = await ResolveUnitPricesAsync(new[] { product }, userId, ct);

        return prices[product.Id];
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyDictionary<long, ResolvedPrice>> ResolveUnitPricesAsync(
        IEnumerable<Product> products,
        long? userId,
        CancellationToken ct = default)
    {
        var productList = products.ToList();
        var result = new Dictionary<long, ResolvedPrice>();

        if (productList.Count == 0)
        {
            return result;
        }

        var now = DateTimeOffset.UtcNow;

        // Get all active promotions that are currently valid.
        var activePromotions = await _db.Promotions
            .Where(p => p.IsActive && p.StartsAt <= now && p.EndsAt >= now)
            .Include(p => p.Categories)
            .Include(p => p.Brands)
            .Include(p => p.Clients)
            .AsSplitQuery()
            .AsNoTracking()
            .ToListAsync(ct);

        // Category ids per product (a product can live in more than one).
        var productIds = productList.Select(p => p.Id).ToList();
        var categoriesByProduct = await _db.ProductCategories
            .Where(pc => productIds.Contains(pc.ProductId))
            .Select(pc => new { pc.ProductId, pc.CategoryId })
            .ToListAsync(ct);
        var categoryLookup = categoriesByProduct
            .GroupBy(x => x.ProductId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.CategoryId).ToHashSet());

        // For each product, determine the best applicable promotion and calculate the final price.
        foreach (var product in productList)
        {
            categoryLookup.TryGetValue(product.Id, out var productCategoryIds);
            productCategoryIds ??= new HashSet<long>();

            Promotion? best = null;
            decimal bestPrice = product.BasePrice;

            foreach (var promo in activePromotions)
            {
                if (!ClientQualifies(promo, userId))
                {
                    continue;
                }

                if (!ProductQualifies(promo, product, productCategoryIds))
                {
                    continue;
                }

                var candidate = ApplyDiscount(product.BasePrice, promo);

                if (best is null || candidate < bestPrice)
                {
                    best = promo;
                    bestPrice = candidate;
                }
            }

            result[product.Id] = new ResolvedPrice(bestPrice < 0 ? 0 : bestPrice, best?.Id);
        }

        return result;
    }

    /// <summary>
    /// Determines if a given user qualifies for a promotion based on client restrictions.
    /// </summary>
    /// <param name="promo">The promotion to check against.</param>
    /// <param name="userId">The ID of the user to check.</param>
    /// <returns>True if the user qualifies for the promotion, false otherwise.</returns>
    private static bool ClientQualifies(Promotion promo, long? userId)
    {
        if (promo.Clients.Count == 0)
        {
            return true; // no client restrictions
        }

        return userId is not null && promo.Clients.Any(c => c.UserId == userId.Value);
    }

    /// <summary>
    /// Determines if a given product qualifies for a promotion based on category and brand restrictions.
    /// </summary>
    /// <param name="promo">The promotion to check against.</param>
    /// <param name="product">The product to check.</param>
    /// <param name="productCategoryIds">The set of category IDs the product belongs to.</param>
    /// <returns>True if the product qualifies for the promotion, false otherwise.</returns>
    private static bool ProductQualifies(Promotion promo, Product product, HashSet<long> productCategoryIds)
    {
        var hasCategoryScope = promo.Categories.Count > 0;
        var hasBrandScope = promo.Brands.Count > 0;

        if (!hasCategoryScope && !hasBrandScope)
        {
            return true; // no product restrictions
        }

        var matchesCategory = hasCategoryScope && promo.Categories.Any(c => productCategoryIds.Contains(c.CategoryId));
        var matchesBrand = hasBrandScope && product.BrandId is not null && promo.Brands.Any(b => b.BrandId == product.BrandId);

        return matchesCategory || matchesBrand;
    }

    /// <summary>
    /// Applies the discount from a promotion to a base price, returning the final price after discount.
    /// </summary>
    /// <param name="basePrice">The original price of the product before any discounts.</param>
    /// <param name="promo">The promotion to apply.</param>
    /// <returns>The final price after applying the promotion's discount.</returns>
    private static decimal ApplyDiscount(decimal basePrice, Promotion promo) => promo.DiscountType switch
    {
        DiscountType.Percentage => Math.Round(basePrice * (1 - promo.DiscountValue / 100m), 4),
        DiscountType.FixedAmount => Math.Max(0, basePrice - promo.DiscountValue),
        _ => basePrice,
    };
}
