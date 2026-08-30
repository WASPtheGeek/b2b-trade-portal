namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Self-referencing adjacency list. Katalogs -> Grupa -> apakšgrupa.
/// </summary>
public class Category
{
    /// <summary>
    /// Gets or sets the unique identifier for the category.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the parent category, if any.
    /// </summary>
    public long? ParentId { get; set; }

    /// <summary>
    /// Gets or sets the parent category, if any.
    /// </summary>
    public Category? Parent { get; set; }

    /// <summary>
    /// Gets or sets the name of the category.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets the URL-friendly slug for the category.
    /// </summary>
    public string Slug { get; set; } = null!;

    /// <summary>
    /// Gets or sets the description of the category, if any.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the sort order of the category among its siblings.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the category was created manually rather than imported.
    /// </summary>
    public bool IsCustom { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the category should be shown in the navigation menu.
    /// </summary>
    public bool ShowInMenu { get; set; } = true;

    /// <summary>
    /// Gets or sets the date and time from which the category is active, if restricted.
    /// </summary>
    public DateTimeOffset? ActiveFrom { get; set; }

    /// <summary>
    /// Gets or sets the date and time until which the category is active, if restricted.
    /// </summary>
    public DateTimeOffset? ActiveTo { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the category in the external/source system, if imported.
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the category was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the category was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Category> Children { get; set; } = new List<Category>();
    public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
}
