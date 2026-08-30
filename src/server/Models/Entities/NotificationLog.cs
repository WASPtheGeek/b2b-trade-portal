using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Durable outbox row. Rows are inserted automatically by Postgres triggers
/// (trg_notify_admin_on_registration, trg_notify_on_order_created) — the API
/// never inserts into this table directly. A background sender (not yet
/// implemented, see claude/project-plan.md Phase 2/5) should poll
/// Status == Pending, send the email, and mark it Sent/Failed.
/// </summary>
public class NotificationLog
{
    /// <summary>
    /// Gets or sets the unique identifier for the notification log entry.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the type of notification (e.g. admin approval request).
    /// </summary>
    public string NotificationType { get; set; } = null!;

    /// <summary>
    /// Gets or sets the email address the notification is addressed to.
    /// </summary>
    public string RecipientEmail { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the user this notification relates to, if any.
    /// </summary>
    public long? RelatedUserId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the order this notification relates to, if any.
    /// </summary>
    public long? RelatedOrderId { get; set; }

    /// <summary>
    /// Gets or sets the current delivery status of the notification.
    /// </summary>
    public NotificationStatus Status { get; set; } = NotificationStatus.Pending;

    /// <summary>
    /// Gets or sets the date and time when the notification was sent, if sent.
    /// </summary>
    public DateTimeOffset? SentAt { get; set; }

    /// <summary>
    /// Gets or sets the error message, if the notification failed to send.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the notification was enqueued.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
