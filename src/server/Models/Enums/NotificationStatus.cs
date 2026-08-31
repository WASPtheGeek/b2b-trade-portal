namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The delivery status of a queued notification. 
/// Stored as a SMALLINT in Database.
/// </summary>
public enum NotificationStatus
{
    /// <summary>
    /// Queued, not yet sent.
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Sent successfully.
    /// </summary>
    Sent = 2,

    /// <summary>
    /// Failed to send.
    /// </summary>
    Failed = 3,
}
