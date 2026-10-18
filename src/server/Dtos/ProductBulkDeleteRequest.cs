using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// Request to permanently delete several products at once.
/// </summary>
public record ProductBulkDeleteRequest
{
    /// <summary>
    /// Gets the IDs of the products to delete.
    /// </summary>
    [Required]
    [MinLength(1)]
    [MaxLength(1000)]
    public IReadOnlyList<long> Ids { get; init; } = [];
}
