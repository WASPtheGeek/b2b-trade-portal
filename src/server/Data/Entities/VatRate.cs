using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class VatRate
{
    public short Id { get; set; }

    public decimal Rate { get; set; }

    public string Label { get; set; } = null!;

    public bool IsDefault { get; set; }

    public DateOnly ValidFrom { get; set; }

    public DateOnly? ValidTo { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
