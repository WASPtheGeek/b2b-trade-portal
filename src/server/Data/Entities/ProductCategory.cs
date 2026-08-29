using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class ProductCategory
{
    public long ProductId { get; set; }

    public long CategoryId { get; set; }

    public bool IsPrimary { get; set; }

    public int SortOrder { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
