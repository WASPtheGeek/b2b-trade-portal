namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The overall status of an import batch.
/// Stored as a SMALLINT in Database.
/// </summary>
public enum ImportStatus
{
    /// <summary>
    /// Queued, not yet started.
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Currently being processed.
    /// </summary>
    Running = 2,

    /// <summary>
    /// Completed with no failed records.
    /// </summary>
    Success = 3,

    /// <summary>
    /// Failed outright.
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Completed with some failed records.
    /// </summary>
    Partial = 5,
}
