using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a sellable product and its packaging/pricing rules.
/// </summary>
public class Product
{
    /// <summary>
    /// Gets or sets the unique identifier for the product.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the product's stock-keeping unit code.
    /// </summary>
    public string Sku { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the product in the external/source system, if imported.
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Gets or sets the name of the product.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets the description of the product, if any.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the price without VAT, per single piece. Never sent to
    /// anonymous callers — see PricingService / the price-visibility rule in
    /// claude/api-design.md §4.4.</summary>
    public decimal BasePrice { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the VAT rate applied to the product.
    /// </summary>
    public short VatRateId { get; set; }

    /// <summary>
    /// Gets or sets the VAT rate applied to the product.
    /// </summary>
    public VatRate VatRate { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the product's brand, if any.
    /// </summary>
    public long? BrandId { get; set; }

    /// <summary>
    /// Gets or sets the product's brand, if any.
    /// </summary>
    public Brand? Brand { get; set; }

    /// <summary>
    /// Gets or sets the product's EAN barcode, if any.
    /// </summary>
    public string? Ean { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the product can be ordered by the individual piece.
    /// </summary>
    public bool SoldByPiece { get; set; } = true;

    /// <summary>
    /// Gets or sets the number of pieces per box, if the product can be ordered by the box.
    /// </summary>
    public int? PiecesPerBox { get; set; }

    /// <summary>
    /// Gets or sets the number of pieces per package, if the product can be ordered by the package.
    /// </summary>
    public int? PiecesPerPackage { get; set; }

    /// <summary>
    /// Gets or sets the date the product was added to the catalog.
    /// </summary>
    public DateOnly DateAdded { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the product is currently active/visible.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the date and time when the product was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the product was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductAttributeValue> AttributeValues { get; set; } = new List<ProductAttributeValue>();

    /// <summary>True if this product can be ordered at all in the given
    /// packaging unit. Mirrors the import-time validation rule in
    /// claude/api-design.md §5 (a product with SoldByPiece=false and no
    /// pack/box multiplier can never be ordered).</summary>
    public bool SupportsUnit(PackagingUnit unit) => unit switch
    {
        PackagingUnit.Piece => SoldByPiece,
        PackagingUnit.Package => PiecesPerPackage is > 0,
        PackagingUnit.Box => PiecesPerBox is > 0,
        _ => false,
    };

    public int PiecesPerUnit(PackagingUnit unit) => unit switch
    {
        PackagingUnit.Piece => 1,
        PackagingUnit.Package => PiecesPerPackage ?? 0,
        PackagingUnit.Box => PiecesPerBox ?? 0,
        _ => 0,
    };
}
