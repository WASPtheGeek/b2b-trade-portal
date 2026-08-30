namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The outcome of a single record within an import batch. 
/// Stored as a SMALLINT in Database.
/// </summary>
public enum ImportRecordStatus
{
    /// <summary>
    /// The record imported successfully.
    /// </summary>
    Success = 1,

    /// <summary>
    /// The record failed to import.
    /// </summary>
    Failed = 2,

    /// <summary>
    /// The record was skipped.
    /// </summary>
    Skipped = 3,
}
