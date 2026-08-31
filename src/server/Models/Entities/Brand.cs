namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a brand that can be associated with products.
/// </summary>
public class Brand
{
    /// <summary>
    /// Gets or sets the unique identifier for the brand.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the brand.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the brand in the external/source system, if imported.
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Gets or sets the filename of the brand's logo image, if any.
    /// </summary>
    public string? LogoFilename { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the brand was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
