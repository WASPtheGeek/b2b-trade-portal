namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents an image associated with a product.
/// </summary>
public class ProductImage
{
    /// <summary>
    /// Gets or sets the unique identifier for the image.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the product this image belongs to.
    /// </summary>
    public long ProductId { get; set; }

    /// <summary>
    /// Gets or sets the product this image belongs to.
    /// </summary>
    public Product Product { get; set; } = null!;

    /// <summary>
    /// Gets or sets the filename of the image.
    /// </summary>
    public string Filename { get; set; } = null!;

    /// <summary>
    /// Gets or sets the alt text for the image, if any.
    /// </summary>
    public string? AltText { get; set; }

    /// <summary>
    /// Gets or sets the sort order of the image among the product's images.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the image was added.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
