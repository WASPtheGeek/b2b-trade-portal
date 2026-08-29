using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class Order
{
    public long Id { get; set; }

    public string OrderNumber { get; set; } = null!;

    public long UserId { get; set; }

    public short Status { get; set; }

    public string Currency { get; set; } = null!;

    public decimal SubtotalAmount { get; set; }

    public decimal VatAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Notes { get; set; }

    public DateTime PlacedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();

    public virtual ICollection<OrderAddress> OrderAddresses { get; set; } = new List<OrderAddress>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<OrderStatusHistory> OrderStatusHistories { get; set; } = new List<OrderStatusHistory>();

    public virtual User User { get; set; } = null!;
}
