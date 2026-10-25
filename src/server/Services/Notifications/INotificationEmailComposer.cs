using Elkaro.Server.Models.Entities;

namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Turns a <see cref="NotificationLog"/> outbox row into the email to send for it.
/// </summary>
public interface INotificationEmailComposer
{
    /// <summary>
    /// Builds the email for the given notification, loading the related order/user as needed.
    /// </summary>
    /// <param name="notification">The outbox row to compose an email for.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The composed <see cref="EmailMessage"/>.</returns>
    /// <exception cref="InvalidOperationException">
    /// The notification type is unknown or its related entity no longer exists.
    /// </exception>
    Task<EmailMessage> ComposeAsync(NotificationLog notification, CancellationToken ct);
}
