using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a placed order and its aggregate totals.
/// </summary>
public class Order
{
    /// <summary>
    /// Gets or sets the unique identifier for the order.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the human-readable order number.
    /// </summary>
    public string OrderNumber { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the user who placed the order.
    /// </summary>
    public long UserId { get; set; }

    /// <summary>
    /// Gets or sets the user who placed the order.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Gets or sets the current status of the order.
    /// </summary>
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    /// <summary>
    /// Gets or sets the ISO currency code for the order's monetary amounts.
    /// </summary>
    public string Currency { get; set; } = "EUR";

    // Kept in sync by the DB trigger recalc_order_totals() whenever
    // order_items change — the API should reload these after writing line
    // items rather than trusting values computed in memory beforehand.

    /// <summary>
    /// Gets or sets the order subtotal before VAT. Kept in sync by the DB trigger recalc_order_totals().
    /// </summary>
    public decimal SubtotalAmount { get; set; }

    /// <summary>
    /// Gets or sets the total VAT amount for the order. Kept in sync by the DB trigger recalc_order_totals().
    /// </summary>
    public decimal VatAmount { get; set; }

    /// <summary>
    /// Gets or sets the total amount for the order, including VAT. Kept in sync by the DB trigger recalc_order_totals().
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Gets or sets free-text notes about the order, if any.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the order was placed.
    /// </summary>
    public DateTimeOffset PlacedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the order was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderAddress> Addresses { get; set; } = new List<OrderAddress>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
}
