using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// This DTO represents a product packaging option.
/// Price fields are nullable for guests.
/// </summary>
/// <param name="Unit">The unit type (e.g., "box", "package").</param>
/// <param name="PiecesPerUnit">The number of pieces contained in one unit.</param>
/// <param name="Price">The price for one unit, excluding VAT; null for guests.</
public record ProductPackagingOptionDto(
    string Unit,
    int PiecesPerUnit,
    decimal? Price);

/// <summary>
/// This DTO represents a product item in a list view.
/// </summary>
/// <param name="Id">The unique identifier of the product.</param>
/// <param name="Sku">The stock keeping unit of the product.</param>
/// <param name="Name">The name of the product.</param>
/// <param name="Ean">The European Article Number of the product.</param>
/// <param name="BrandName">The name of the brand associated with the product.</param>
/// <param name="ThumbnailFilename">The filename of the product's thumbnail image.</param>
/// <param name="IsActive">Indicates whether the product is active.</param>
/// <param name="BasePrice">The base price of the product.</param>
/// <param name="PackagingOptions">The list of packaging options for the product.</param>
public record ProductListItemDto(
    long Id,
    string Sku,
    string Name,
    string? Ean,
    string? BrandName,
    string? ThumbnailFilename,
    bool IsActive,
    decimal? BasePrice,
    IReadOnlyList<ProductPackagingOptionDto> PackagingOptions);

/// <summary>
/// This DTO represents detailed information about a product.
/// </summary>
/// <param name="Id">The unique identifier of the product.</param>
/// <param name="Sku">The stock keeping unit of the product.</param>
/// <param name="Name">The name of the product.</param>
/// <param name="Description">The description of the product.</param>
/// <param name="Ean">The European Article Number of the product.</param>
/// <param name="BrandName">The name of the brand associated with the product.</param>
/// <param name="IsActive">Indicates whether the product is active.</param>
/// <param name="BasePrice">The base price of the product.</param>
/// <param name="VatRatePercent">The VAT rate percentage applicable to the product.</param>
/// <param name="PackagingOptions">The list of packaging options for the product.</param>
/// <param name="ImageFilenames">The list of image filenames for the product.</param>
/// <param name="Categories">The list of categories the product belongs to.</param>
/// <param name="Attributes">The dictionary of product attributes.</param>
public record ProductDetailDto(
    long Id,
    string Sku,
    string Name,
    string? Description,
    string? Ean,
    string? BrandName,
    bool IsActive,
    decimal? BasePrice,
    decimal VatRatePercent,
    IReadOnlyList<ProductPackagingOptionDto> PackagingOptions,
    IReadOnlyList<string> ImageFilenames,
    IReadOnlyList<CategoryDto> Categories,
    IReadOnlyDictionary<string, string> Attributes);

/// <summary>
/// This DTO represents the request payload for creating or updating a product.
/// </summary>
public record ProductUpsertRequest
{
    /// <summary>
    /// Gets or initializes the stock keeping unit (SKU) of the product.
    /// </summary>
    [Required, MaxLength(80)]
    public string Sku { get; init; } = null!;

    /// <summary>
    /// Gets or initializes the name of the product.
    /// </summary>
    [Required, MaxLength(255)]
    public string Name { get; init; } = null!;

    /// <summary>
    /// Gets or initializes the description of the product.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets or initializes the base price of the product, excluding VAT.
    /// </summary>
    [Range(0, double.MaxValue)]
    public decimal BasePrice { get; init; }

    /// <summary>
    /// Gets or initializes the ID of the VAT rate applicable to the product.
    /// </summary>
    public short VatRateId { get; init; }

    /// <summary>
    /// Gets or initializes the Brand identifier.
    /// </summary>
    public long? BrandId { get; init; }

    /// <summary>
    /// Gets or initializes the European Article Number of the product.
    /// </summary>
    public string? Ean { get; init; }

    /// <summary>
    /// Gets or initializes a value indicating whether the product is sold by piece.
    /// </summary>
    public bool SoldByPiece { get; init; } = true;
    /// <summary>
    /// Gets or initializes the number of pieces per box.
    /// </summary>
    public int? PiecesPerBox { get; init; }

    /// <summary>
    /// Gets or initializes the number of pieces per package.
    /// </summary>
    public int? PiecesPerPackage { get; init; }

    /// <summary>
    /// Gets or initializes a value indicating whether the product is active.
    /// </summary>
    public bool IsActive { get; init; } = true;

    /// <summary>
    /// Gets or initializes the list of category IDs the product belongs to.
    /// </summary>
    public List<long> CategoryIds { get; init; } = new();
}

/// <summary>
/// This DTO represents the request payload for updating the active status of a product.
/// </summary>
/// <param name="IsActive">Indicates whether the product is active.</param>
public record ProductStatusUpdateRequest(bool IsActive);
