using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class NotificationLog
{
    public long Id { get; set; }

    public string NotificationType { get; set; } = null!;

    public string RecipientEmail { get; set; } = null!;

    public long? RelatedUserId { get; set; }

    public long? RelatedOrderId { get; set; }

    public short Status { get; set; }

    public DateTime? SentAt { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order? RelatedOrder { get; set; }

    public virtual User? RelatedUser { get; set; }
}
