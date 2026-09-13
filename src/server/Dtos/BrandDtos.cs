using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// Represents a brand option available to assign to a product.
/// </summary>
/// <param name="Id">The unique identifier of the brand.</param>
/// <param name="Name">The name of the brand.</param>
public record BrandDto(long Id, string Name);

/// <summary>
/// Represents a request to create or update a brand.
/// </summary>
public record BrandUpsertRequest
{
    /// <summary>
    /// Gets or initializes the name of the brand.
    /// </summary>
    [Required, MaxLength(150)]
    public string Name { get; init; } = null!;
}
