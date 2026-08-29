using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class ProductImage
{
    public long Id { get; set; }

    public long ProductId { get; set; }

    public string Filename { get; set; } = null!;

    public string? AltText { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Product Product { get; set; } = null!;
}
