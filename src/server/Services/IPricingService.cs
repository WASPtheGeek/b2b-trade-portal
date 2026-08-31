using Elkaro.Server.Models.Entities;

namespace Elkaro.Server.Services;

/// <summary>
/// Represents the resolved price for a product, including the VAT-exclusive unit price and
/// the ID of any applied promotion.
/// </summary>
/// <param name="UnitPrice">The VAT-exclusive unit price of the product.</param>
/// <param name="AppliedPromotionId">The ID of the applied promotion, if any.</param>
public record ResolvedPrice(decimal UnitPrice, long? AppliedPromotionId);

/// <summary>
/// Service interface for resolving product prices, including VAT-exclusive unit prices and applicable promotions.
/// </summary>
public interface IPricingService
{
    /// <summary>
    /// Resolves the VAT-exclusive price for one piece of <paramref name="product"/>
    /// for the given caller, applying the best currently-active promotion.
    /// Returns product.BasePrice with no promotion applied when no promotions are active.
    /// </summary>
    /// <param name="product">The product to resolve the price for.</param>
    /// <param name="userId">The ID of the user for whom to resolve the price. Can be null for anonymous users.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>
    /// A <see cref="ResolvedPrice"/> containing the resolved unit price and the ID of the applied promotion (if any).
    /// </returns>
    Task<ResolvedPrice> ResolveUnitPriceAsync(Product product, long? userId, CancellationToken ct = default);

    /// <summary>
    /// Batch form to avoid N+1 promotion queries when rendering a product listing page. 
    /// Returns a price per product id.
    /// </summary>
    Task<IReadOnlyDictionary<long, ResolvedPrice>> ResolveUnitPricesAsync(
        IEnumerable<Product> products, long? userId, CancellationToken ct = default);
}
