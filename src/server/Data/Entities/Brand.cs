using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class Brand
{
    public long Id { get; set; }

    public string Name { get; set; } = null!;

    public string? ExternalId { get; set; }

    public string? LogoFilename { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
}
