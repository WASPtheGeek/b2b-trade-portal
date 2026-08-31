using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a single status change recorded against an order.
/// </summary>
public class OrderStatusHistory
{
    /// <summary>
    /// Gets or sets the unique identifier for the status history entry.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the order this entry belongs to.
    /// </summary>
    public long OrderId { get; set; }

    /// <summary>
    /// Gets or sets the order this entry belongs to.
    /// </summary>
    public Order Order { get; set; } = null!;

    /// <summary>
    /// Gets or sets the status the order was changed to.
    /// </summary>
    public OrderStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who made the change, if any.
    /// </summary>
    public long? ChangedBy { get; set; }

    /// <summary>
    /// Gets or sets free-text notes about the status change, if any.
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the status change occurred.
    /// </summary>
    public DateTimeOffset ChangedAt { get; set; }
}
