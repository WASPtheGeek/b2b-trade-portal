namespace Elkaro.Server.Services.Import;

/// <summary>
/// The <see cref="RawImportRow"/> record represents a single row of data imported from a supplier's CSV or XLSX file.
/// Type conversion and validation are deferred to the <see cref="ProductRowImporter"/> class,
/// which processes these raw string values into strongly-typed product data.
/// </summary>
public record RawImportRow
{
    /// <summary>
    /// Gets or initializes the row number in the source file, useful for error reporting and debugging.
    /// </summary>
    public int RowNumber { get; init; }

    /// <summary>
    /// Gets or initializes the EAN (European Article Number) of the product.
    /// </summary>
    public string? Ean { get; init; }              // EAN

    /// <summary>
    /// Gets or initializes the name of the product.
    /// </summary>
    public string? Name { get; init; }              // Nosaukums

    /// <summary>
    /// Gets or initializes the brand of the product.
    /// </summary>
    public string? Brand { get; init; }              // Zīmols

    /// <summary>
    /// Gets or initializes the raw price of the product as a string.
    /// </summary>
    public string? PriceRaw { get; init; }              // Cena

    /// <summary>
    /// Gets or initializes a raw string indicating if the product is sold by piece (0/1).
    /// </summary>
    public string? SoldByPieceRaw { get; init; }        // gb (0/1)

    /// <summary>
    /// Gets or initializes the raw number of pieces per package.
    /// </summary>
    public string? PiecesPerPackageRaw { get; init; }   // iep.

    /// <summary>
    /// Gets or initializes the raw number of pieces per box.
    /// </summary>
    public string? PiecesPerBoxRaw { get; init; }       // kaste

    /// <summary>
    /// Gets or initializes the description of the product.
    /// </summary>
    public string? Description { get; init; }              // Apraksts

    /// <summary>
    /// Gets or initializes the catalog name.
    /// </summary>
    public string? Catalog { get; init; }              // Katalogs

    /// <summary>
    /// Gets or initializes the group name.
    /// </summary>
    public string? Group { get; init; }              // Grupa

    /// <summary>
    /// Gets or initializes the subgroup name.
    /// </summary>
    public string? Subgroup { get; init; }              // apakšgrupa
}
