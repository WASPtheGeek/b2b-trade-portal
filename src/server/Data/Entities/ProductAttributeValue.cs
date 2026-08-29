using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class ProductAttributeValue
{
    public long Id { get; set; }

    public long ProductId { get; set; }

    public long AttributeDefinitionId { get; set; }

    public string ValueText { get; set; } = null!;

    public virtual AttributeDefinition AttributeDefinition { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
