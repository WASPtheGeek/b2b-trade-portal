using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class User
{
    public long Id { get; set; }

    public short RoleId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? BusinessName { get; set; }

    public string? RegistrationNumber { get; set; }

    public string? VatNumber { get; set; }

    public string? Phone { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public bool IsVatExempt { get; set; }

    public short Status { get; set; }

    public long? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual ICollection<ImportBatch> ImportBatches { get; set; } = new List<ImportBatch>();

    public virtual ICollection<User> InverseApprovedByNavigation { get; set; } = new List<User>();

    public virtual ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();

    public virtual ICollection<OrderStatusHistory> OrderStatusHistories { get; set; } = new List<OrderStatusHistory>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<UserAddress> UserAddresses { get; set; } = new List<UserAddress>();

    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();

    public virtual ICollection<Promotion> PromotionsNavigation { get; set; } = new List<Promotion>();
}
