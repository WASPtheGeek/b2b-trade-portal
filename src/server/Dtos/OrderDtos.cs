using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// This DTO represents a request to create an order item.
/// </summary>
public record CreateOrderItemRequest
{
    /// <summary>
    /// Gets or initializes the ID of the product to be ordered.
    /// </summary>
    [Required]
    public long ProductId { get; init; }

    /// <summary>
    /// Gets or initializes the unit of packaging for the product (e.g., "piece", "package", "box").
    /// </summary>
    [Required]
    public string PackagingUnit { get; init; } = "piece";

    /// <summary>
    /// Gets or initializes the quantity of the product to be ordered.
    /// </summary>
    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }
}

/// <summary>
/// This DTO represents a request to create an order.
/// </summary>
public record CreateOrderRequest
{
    /// <summary>
    /// Gets or initializes the list of items to be included in the order.
    /// </summary>
    [Required, MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; init; } = new();

    /// <summary>
    /// Gets or initializes the ID of the shipping address for the order. 
    /// Optional; if not provided, the user's default shipping address will be used.
    /// </summary>
    public long? ShippingAddressId { get; init; }

    /// <summary>
    /// Gets or initializes the ID of the billing address for the order. 
    /// Optional; if not provided, the user's default billing address will be used.
    /// </summary>
    public long? BillingAddressId { get; init; }

    /// <summary>
    /// Gets or initializes additional notes for the order.
    /// </summary>
    [MaxLength(2000)]
    public string? Notes { get; init; }
}

/// <summary>
/// This DTO represents an item in an order.
/// </summary>
/// <param name="Id">The unique identifier of the order item.</param>
/// <param name="ProductId">The ID of the product.</param>
/// <param name="Sku">The stock keeping unit of the product.</param>
/// <param name="ProductName">The name of the product.</param>
/// <param name="Brand">The brand of the product.</param>
/// <param name="PackagingUnit">The unit of packaging for the product.</param>
/// <param name="PiecesPerUnit">The number of pieces per packaging unit.</param>
/// <param name="Quantity">The quantity of the product ordered.</param>
/// <param name="UnitPrice">The unit price of the product.</param>
/// <param name="VatRatePercent">The VAT rate percentage for the product.</param>
/// <param name="LineSubtotal">The subtotal amount for the line item.</param>
/// <param name="LineVatAmount">The VAT amount for the line item.</param>
/// <param name="LineTotal">The total amount for the line item.</param>
public record OrderItemDto(
    long Id,
    long? ProductId,
    string Sku,
    string ProductName,
    string? Brand,
    string PackagingUnit,
    int PiecesPerUnit,
    int Quantity,
    decimal UnitPrice,
    decimal VatRatePercent,
    decimal LineSubtotal,
    decimal LineVatAmount,
    decimal LineTotal);

/// <summary>
/// This DTO represents an order.
/// </summary>
/// <param name="Id">The unique identifier of the order.</param>
/// <param name="OrderNumber">The order number.</param>
/// <param name="Status">The status of the order.</param>
/// <param name="Currency">The currency of the order.</param>
/// <param name="SubtotalAmount">The subtotal amount of the order.</param>
/// <param name="VatAmount">The VAT amount of the order.</param>
/// <param name="TotalAmount">The total amount of the order.</param>
/// <param name="Notes">Additional notes for the order.</param>
/// <param name="PlacedAt">The date and time when the order was placed.</param>
/// <param name="Items">The list of items in the order.</param>
public record OrderDto(
    long Id,
    string OrderNumber,
    string Status,
    string Currency,
    decimal SubtotalAmount,
    decimal VatAmount,
    decimal TotalAmount,
    string? Notes,
    DateTimeOffset PlacedAt,
    IReadOnlyList<OrderItemDto> Items);


/// <summary>
/// This DTO represents a summary of an order, typically used for listing orders without detailed item information. 
/// </summary>
/// <param name="Id">The unique identifier of the order.</param>
/// <param name="OrderNumber">The order number.</param>
/// <param name="Status">The status of the order.</param>
/// <param name="Currency">The currency of the order.</param>
/// <param name="TotalAmount">The total amount of the order.</param>
/// <param name="PlacedAt">The date and time when the order was placed.</param>
/// <param name="UserId">The unique identifier of the user who placed the order.</param>
/// <param name="BusinessName">The name of the business associated with the order.</param>
public record OrderSummaryDto(
    long Id,
    string OrderNumber,
    string Status,
    string Currency,
    decimal TotalAmount,
    DateTimeOffset PlacedAt,
    long UserId,
    string? BusinessName);

/// <summary>
/// This DTO represents a request to update the status of an order.
/// </summary>
public record OrderStatusUpdateRequest
{
    /// <summary>
    /// Gets or initializes the new status for the order (e.g., "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded").
    /// </summary>
    [Required]
    public string Status { get; init; } = null!;

    /// <summary>
    /// Gets or initializes the reason for the status update, if applicable (e.g., reason for cancellation or refund).
    /// </summary>
    [MaxLength(500)]
    public string? Note { get; init; }
}
