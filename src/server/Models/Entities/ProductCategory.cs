namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Join entity linking a product to a category.
/// </summary>
public class ProductCategory
{
    /// <summary>
    /// Gets or sets the identifier of the product.
    /// </summary>
    public long ProductId { get; set; }

    /// <summary>
    /// Gets or sets the product assigned to the category.
    /// </summary>
    public Product Product { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the category.
    /// </summary>
    public long CategoryId { get; set; }

    /// <summary>
    /// Gets or sets the category the product is assigned to.
    /// </summary>
    public Category Category { get; set; } = null!;

    /// <summary>
    /// Gets or sets a value indicating whether this is the product's primary category.
    /// </summary>
    public bool IsPrimary { get; set; }

    /// <summary>
    /// Gets or sets the sort order of the product within the category.
    /// </summary>
    public int SortOrder { get; set; }
}
