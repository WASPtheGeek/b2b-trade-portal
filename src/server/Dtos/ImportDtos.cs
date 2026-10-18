namespace Elkaro.Server.Dtos;

/// <summary>
/// DTO representing the acceptance of an import job.
/// </summary>
/// <param name="JobId">The ID of the import job.</param>
public record ImportJobAcceptedDto(long JobId);

/// <summary>
/// DTO representing the status of an import job.
/// </summary>
/// <param name="JobId">The ID of the import job.</param>
/// <param name="Status">The current status of the import job.</param>
/// <param name="TotalRows">The total number of rows in the import job.</param>
/// <param name="ProcessedRows">The number of rows that have been processed.</param>
/// <param name="CreatedCount">The number of rows that created a new product.</param>
/// <param name="UpdatedCount">The number of rows that updated an existing product.</param>
/// <param name="ErrorCount">The number of rows that encountered errors.</param>
/// <param name="CreatedCategoryCount">The number of categories the import created.</param>
/// <param name="StartedAt">The timestamp when the import job started.</param>
/// <param name="FinishedAt">The timestamp when the import job finished, if applicable.</param>
public record ImportJobStatusDto(
    long JobId,
    string Status,
    int TotalRows,
    int ProcessedRows,
    int CreatedCount,
    int UpdatedCount,
    int ErrorCount,
    int CreatedCategoryCount,
    DateTimeOffset StartedAt,
    DateTimeOffset? FinishedAt);
