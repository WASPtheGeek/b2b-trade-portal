using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// Request to set the active status of several products at once.
/// </summary>
public record ProductBulkStatusUpdateRequest
{
    /// <summary>
    /// Gets the IDs of the products to update.
    /// </summary>
    [Required]
    [MinLength(1)]
    [MaxLength(1000)]
    public IReadOnlyList<long> Ids { get; init; } = [];

    /// <summary>
    /// Gets a value indicating whether the products should be active.
    /// </summary>
    public bool IsActive { get; init; }
}
