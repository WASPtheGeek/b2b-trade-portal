using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class AttributeDefinition
{
    public long Id { get; set; }

    public long? CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public short DataType { get; set; }

    public string? Unit { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<ProductAttributeValue> ProductAttributeValues { get; set; } = new List<ProductAttributeValue>();
}
