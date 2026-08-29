using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class OrderStatusHistory
{
    public long Id { get; set; }

    public long OrderId { get; set; }

    public short Status { get; set; }

    public long? ChangedBy { get; set; }

    public string? Note { get; set; }

    public DateTime ChangedAt { get; set; }

    public virtual User? ChangedByNavigation { get; set; }

    public virtual Order Order { get; set; } = null!;
}
