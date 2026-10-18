using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Services.Settings;

/// <summary>
/// The header text the ERP import expects for each product field. Matching against the file's
/// header row is case-insensitive and ignores surrounding whitespace. Defaults are the client's
/// current ERP export headers.
/// </summary>
public class ImportColumnSettings : IValidatableObject
{
    private const int MaxHeaderLength = 100;

    /// <summary>
    /// Gets or sets the header of the EAN column - the upsert key, and how the header row is found.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Ean { get; set; } = "EAN";

    /// <summary>
    /// Gets or sets the header of the product name column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Name { get; set; } = "Nosaukums";

    /// <summary>
    /// Gets or sets the header of the brand column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Brand { get; set; } = "Zīmols";

    /// <summary>
    /// Gets or sets the header of the price column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Price { get; set; } = "Cena";

    /// <summary>
    /// Gets or sets the header of the sold-by-piece (0/1) column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string SoldByPiece { get; set; } = "gb";

    /// <summary>
    /// Gets or sets the header of the pieces-per-package column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string PiecesPerPackage { get; set; } = "iep.";

    /// <summary>
    /// Gets or sets the header of the pieces-per-box column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string PiecesPerBox { get; set; } = "kaste";

    /// <summary>
    /// Gets or sets the header of the description column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Description { get; set; } = "Apraksts";

    /// <summary>
    /// Gets or sets the header of the top-level catalog column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Catalog { get; set; } = "Katalogs";

    /// <summary>
    /// Gets or sets the header of the group (second category level) column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Group { get; set; } = "Grupa";

    /// <summary>
    /// Gets or sets the header of the subgroup (third category level) column.
    /// </summary>
    [Required]
    [MaxLength(MaxHeaderLength)]
    public string Subgroup { get; set; } = "apakšgrupa";

    /// <summary>
    /// Gets every configured header, in the import file's usual column order.
    /// </summary>
    /// <returns>The header names.</returns>
    public IReadOnlyList<string> AllHeaders() =>
        [Ean, Name, Brand, Price, SoldByPiece, PiecesPerPackage, PiecesPerBox, Description, Catalog, Group, Subgroup];

    /// <summary>
    /// Trims every header, so stray spaces typed in the settings form don't break matching.
    /// </summary>
    /// <returns>This instance, for chaining.</returns>
    public ImportColumnSettings Normalize()
    {
        Ean = Ean.Trim();
        Name = Name.Trim();
        Brand = Brand.Trim();
        Price = Price.Trim();
        SoldByPiece = SoldByPiece.Trim();
        PiecesPerPackage = PiecesPerPackage.Trim();
        PiecesPerBox = PiecesPerBox.Trim();
        Description = Description.Trim();
        Catalog = Catalog.Trim();
        Group = Group.Trim();
        Subgroup = Subgroup.Trim();

        return this;
    }

    /// <inheritdoc/>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var duplicates = AllHeaders()
            .Select(h => h.Trim())
            .Where(h => h.Length > 0)
            .GroupBy(h => h, StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicates.Count > 0)
        {
            yield return new ValidationResult(
                $"Katrai kolonnai jābūt unikālam nosaukumam. Atkārtojas: {string.Join(", ", duplicates)}.");
        }

        if (AllHeaders().Any(string.IsNullOrWhiteSpace))
        {
            yield return new ValidationResult("Kolonnas nosaukums nevar būt tukšs.");
        }
    }
}
