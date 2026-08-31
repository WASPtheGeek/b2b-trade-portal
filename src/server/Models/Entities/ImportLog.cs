using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents the per-record outcome of an import batch.
/// </summary>
public class ImportLog
{
    /// <summary>
    /// Gets or sets the unique identifier for the import log entry.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the import batch this log entry belongs to.
    /// </summary>
    public long BatchId { get; set; }

    /// <summary>
    /// Gets or sets the import batch this log entry belongs to.
    /// </summary>
    public ImportBatch Batch { get; set; } = null!;

    /// <summary>
    /// Gets or sets the type of entity this log entry refers to.
    /// </summary>
    public string EntityType { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the record in the external/source system, if any.
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Gets or sets the row number of this record in the source file.
    /// </summary>
    public int RowNumber { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the corresponding record in this system, if created/updated.
    /// </summary>
    public long? InternalRecordId { get; set; }

    /// <summary>
    /// Gets or sets the outcome status of this record's import.
    /// </summary>
    public ImportRecordStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the error message, if the record failed to import.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the raw payload for this record, stored for troubleshooting.
    /// </summary>
    public string? PayloadJson { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the log entry was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
