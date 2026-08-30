using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents the definition of an attribute that can be associated with products in a specific category.
/// </summary>
public class AttributeDefinition
{
    /// <summary>
    /// Gets or sets the unique identifier for the attribute definition.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the category to which this attribute definition belongs.
    /// </summary>
    public long? CategoryId { get; set; }

    /// <summary>
    /// Gets or sets the category to which this attribute definition belongs.
    /// </summary>
    public Category? Category { get; set; }

    /// <summary>
    /// Gets or sets the name of the attribute.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets the data type of the attribute.
    /// </summary>
    public AttributeDataType DataType { get; set; } = AttributeDataType.Text;

    /// <summary>
    /// Gets or sets the unit of measurement for the attribute, if applicable.
    /// </summary>
    public string? Unit { get; set; }

    /// <summary>
    /// Gets or sets the sort order of the attribute.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the attribute definition was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<ProductAttributeValue> Values { get; set; } = new List<ProductAttributeValue>();
}
