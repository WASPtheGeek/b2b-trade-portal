namespace Elkaro.Server.Dtos;

/// <summary>
/// What happened to a single row of an import job.
/// </summary>
public enum ImportRecordOutcome
{
    /// <summary>
    /// The row created a new product.
    /// </summary>
    Created,

    /// <summary>
    /// The row updated an existing product (matched by EAN).
    /// </summary>
    Updated,

    /// <summary>
    /// The row could not be imported.
    /// </summary>
    Failed,
}
