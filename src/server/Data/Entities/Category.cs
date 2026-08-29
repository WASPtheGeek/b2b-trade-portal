using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class Category
{
    public long Id { get; set; }

    public long? ParentId { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public bool IsCustom { get; set; }

    public bool ShowInMenu { get; set; }

    public DateTime? ActiveFrom { get; set; }

    public DateTime? ActiveTo { get; set; }

    public string? ExternalId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<AttributeDefinition> AttributeDefinitions { get; set; } = new List<AttributeDefinition>();

    public virtual ICollection<Category> InverseParent { get; set; } = new List<Category>();

    public virtual Category? Parent { get; set; }

    public virtual ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
}
