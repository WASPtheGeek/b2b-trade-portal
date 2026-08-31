using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a single run of an import job (CSV/XLSX) and its outcome.
/// </summary>
public class ImportBatch
{
    /// <summary>
    /// Gets or sets the unique identifier for the import batch.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier used to correlate this batch across systems.
    /// </summary>
    public Guid BatchUuid { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Gets or sets the name of the system the import originated from.
    /// </summary>
    public string SourceSystem { get; set; } = null!;

    /// <summary>
    /// Gets or sets the type of entity being imported (e.g. products).
    /// </summary>
    public string EntityType { get; set; } = null!;

    /// <summary>
    /// Gets or sets the current status of the import batch.
    /// </summary>
    public ImportStatus Status { get; set; } = ImportStatus.Pending;

    /// <summary>
    /// Gets or sets the total number of records in the import batch.
    /// </summary>
    public int TotalRecords { get; set; }

    /// <summary>
    /// Gets or sets the number of records successfully imported.
    /// </summary>
    public int SuccessCount { get; set; }

    /// <summary>
    /// Gets or sets the number of records that failed to import.
    /// </summary>
    public int FailureCount { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who triggered the import, if any.
    /// </summary>
    public long? TriggeredBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the import batch started.
    /// </summary>
    public DateTimeOffset StartedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the import batch finished, if completed.
    /// </summary>
    public DateTimeOffset? FinishedAt { get; set; }

    /// <summary>
    /// Gets or sets free-text notes about the import batch, if any.
    /// </summary>
    public string? Notes { get; set; }

    public ICollection<ImportLog> Logs { get; set; } = new List<ImportLog>();
}
