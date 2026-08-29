using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class OrderItem
{
    public long Id { get; set; }

    public long OrderId { get; set; }

    public long? ProductId { get; set; }

    public string SkuSnapshot { get; set; } = null!;

    public string ProductNameSnapshot { get; set; } = null!;

    public string? BrandSnapshot { get; set; }

    public short PackagingUnitUsed { get; set; }

    public int PiecesPerUnitSnapshot { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPriceSnapshot { get; set; }

    public decimal VatRateSnapshot { get; set; }

    public decimal LineSubtotal { get; set; }

    public decimal LineVatAmount { get; set; }

    public decimal LineTotal { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Product? Product { get; set; }
}
