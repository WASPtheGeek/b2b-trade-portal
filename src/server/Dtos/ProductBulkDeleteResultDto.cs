namespace Elkaro.Server.Dtos;

/// <summary>
/// The outcome of a bulk product delete.
/// </summary>
/// <param name="DeletedCount">The number of products that were deleted.</param>
/// <param name="SkippedIds">The IDs of products kept because they've been ordered before.</param>
public record ProductBulkDeleteResultDto(int DeletedCount, IReadOnlyList<long> SkippedIds);
