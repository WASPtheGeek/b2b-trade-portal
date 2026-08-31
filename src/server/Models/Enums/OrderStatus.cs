namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The fulfillment status of an order. 
/// Stored as a SMALLINT in Database.
/// </summary>
public enum OrderStatus
{
    /// <summary>
    /// Placed, not yet confirmed.
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Confirmed by the seller.
    /// </summary>
    Confirmed = 2,

    /// <summary>
    /// Being prepared for shipment.
    /// </summary>
    Processing = 3,

    /// <summary>
    /// Shipped to the customer.
    /// </summary>
    Shipped = 4,

    /// <summary>
    /// Delivered to the customer.
    /// </summary>
    Delivered = 5,

    /// <summary>
    /// Cancelled before delivery.
    /// </summary>
    Cancelled = 6,

    /// <summary>
    /// Refunded after payment.
    /// </summary>
    Refunded = 7,
}
