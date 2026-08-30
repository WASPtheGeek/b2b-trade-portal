using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// Represents a data transfer object for a category, containing its properties.
/// </summary>
/// <param name="Id">The unique identifier of the category.</param>
/// <param name="ParentId">The ID of the parent category, if any.</param>
/// <param name="Name">The name of the category.</param>
/// <param name="Slug">The URL-friendly slug of the category.</param>
/// <param name="Description">The description of the category.</param>
/// <param name="SortOrder">The sort order of the category.</param>
/// <param name="IsCustom">Indicates if the category is custom.</param>
/// <param name="ShowInMenu">Indicates if the category should be shown in the menu.</param>
public record CategoryDto(
    long Id,
    long? ParentId,
    string Name,
    string Slug,
    string? Description,
    int SortOrder,
    bool IsCustom,
    bool ShowInMenu);

/// <summary>
/// Represents a request to create or update a category.
/// </summary>
public record CategoryUpsertRequest
{
    /// <summary>
    /// Gets or initializes the ID of the parent category, if any.
    /// </summary>
    public long? ParentId { get; init; }

    /// <summary>
    /// Gets or initializes the name of the category.
    /// </summary>
    [Required, MaxLength(150)]
    public string Name { get; init; } = null!;

    /// <summary>
    /// Gets or initializes the URL-friendly slug of the category.
    /// </summary>
    [Required, MaxLength(160)]
    public string Slug { get; init; } = null!;

    /// <summary>
    /// Gets or initializes the description of the category.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets or initializes the sort order of the category.
    /// </summary>
    public int SortOrder { get; init; }

    /// <summary>
    /// Gets or initializes a value indicating whether the category is custom.
    /// </summary>
    public bool IsCustom { get; init; }

    /// <summary>
    /// Gets or initializes a value indicating whether the category should be shown in the menu.
    /// </summary>
    public bool ShowInMenu { get; init; } = true;

    /// <summary>
    /// Gets or initializes the date and time from which the category is active.
    /// </summary>
    public DateTimeOffset? ActiveFrom { get; init; }

    /// <summary>
    /// Gets or initializes the date and time until which the category is active.
    /// </summary>
    public DateTimeOffset? ActiveTo { get; init; }
}
