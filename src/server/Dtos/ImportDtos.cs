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
/// <param name="CreatedCount">The number of rows that resulted in new records.</param>
/// <param name="UpdatedCount">The number of rows that updated existing records.</param>
/// <param name="ErrorCount">The number of rows that encountered errors.</param>
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
    DateTimeOffset StartedAt,
    DateTimeOffset? FinishedAt);

/// <summary>
/// DTO representing an error encountered during the processing of a specific row in an import job.
/// </summary>
/// <param name="RowNumber">The number of the row that encountered the error.</param>
/// <param name="Ean">The EAN (European Article Number) of the row, if applicable.</param>
/// <param name="ErrorMessage">The error message describing the issue.</param>
public record ImportRowErrorDto(int RowNumber, string? Ean, string ErrorMessage);
