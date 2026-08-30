using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Full price/VAT/packaging snapshot at time of purchase — authoritative,
/// never re-derived from live product data. See schema design note 4 and
/// the "server trusts nothing the client can lie about" rule in
/// claude/api-design.md §6.
/// </summary>
public class OrderItem
{
    /// <summary>
    /// Gets or sets the unique identifier for the order item.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the order this item belongs to.
    /// </summary>
    public long OrderId { get; set; }

    /// <summary>
    /// Gets or sets the order this item belongs to.
    /// </summary>
    public Order Order { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the product this item refers to, if it still exists.
    /// </summary>
    public long? ProductId { get; set; }

    /// <summary>
    /// Gets or sets the product this item refers to, if it still exists.
    /// </summary>
    public Product? Product { get; set; }

    /// <summary>
    /// Gets or sets the product SKU at the time of purchase.
    /// </summary>
    public string SkuSnapshot { get; set; } = null!;

    /// <summary>
    /// Gets or sets the product name at the time of purchase.
    /// </summary>
    public string ProductNameSnapshot { get; set; } = null!;

    /// <summary>
    /// Gets or sets the product's brand name at the time of purchase, if any.
    /// </summary>
    public string? BrandSnapshot { get; set; }

    /// <summary>
    /// Gets or sets the packaging unit the customer ordered in (piece, package, or box).
    /// </summary>
    public PackagingUnit PackagingUnitUsed { get; set; }

    /// <summary>
    /// Gets or sets the number of pieces per ordered unit at the time of purchase.
    /// </summary>
    public int PiecesPerUnitSnapshot { get; set; } = 1;

    /// <summary>
    /// Gets or sets the quantity ordered, in the ordered packaging unit.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Gets or sets the price per unit (excluding VAT) at the time of purchase.
    /// </summary>
    public decimal UnitPriceSnapshot { get; set; }

    /// <summary>
    /// Gets or sets the VAT rate applied at the time of purchase.
    /// </summary>
    public decimal VatRateSnapshot { get; set; }

    /// <summary>
    /// Gets or sets the line subtotal before VAT.
    /// </summary>
    public decimal LineSubtotal { get; set; }

    /// <summary>
    /// Gets or sets the VAT amount for this line.
    /// </summary>
    public decimal LineVatAmount { get; set; }

    /// <summary>
    /// Gets or sets the total amount for this line, including VAT.
    /// </summary>
    public decimal LineTotal { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the order item was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
