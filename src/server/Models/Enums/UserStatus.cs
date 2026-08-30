namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The approval status of a user account. 
/// Stored as a SMALLINT in Database.
/// </summary>
public enum UserStatus
{
    /// <summary>
    /// Registered, awaiting administrator review.
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Approved by an administrator and able to sign in.
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Rejected by an administrator.
    /// </summary>
    Rejected = 3,

    /// <summary>
    /// Previously approved, later suspended.
    /// </summary>
    Suspended = 4,
}
