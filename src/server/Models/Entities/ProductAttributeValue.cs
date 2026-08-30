namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents the value of a category-specific attribute for a product.
/// </summary>
public class ProductAttributeValue
{
    /// <summary>
    /// Gets or sets the unique identifier for the attribute value.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the product this value belongs to.
    /// </summary>
    public long ProductId { get; set; }

    /// <summary>
    /// Gets or sets the product this value belongs to.
    /// </summary>
    public Product Product { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the attribute definition this value is for.
    /// </summary>
    public long AttributeDefinitionId { get; set; }

    /// <summary>
    /// Gets or sets the attribute definition this value is for.
    /// </summary>
    public AttributeDefinition AttributeDefinition { get; set; } = null!;

    /// <summary>
    /// Gets or sets the value of the attribute, stored as text.
    /// </summary>
    public string ValueText { get; set; } = null!;
}
