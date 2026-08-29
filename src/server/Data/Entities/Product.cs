using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class Product
{
    public long Id { get; set; }

    public string Sku { get; set; } = null!;

    public string? ExternalId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal BasePrice { get; set; }

    public short VatRateId { get; set; }

    public long? BrandId { get; set; }

    public string? Ean { get; set; }

    public bool SoldByPiece { get; set; }

    public int? PiecesPerBox { get; set; }

    public int? PiecesPerPackage { get; set; }

    public DateOnly DateAdded { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Brand? Brand { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<ProductAttributeValue> ProductAttributeValues { get; set; } = new List<ProductAttributeValue>();

    public virtual ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();

    public virtual VatRate VatRate { get; set; } = null!;

    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
}
