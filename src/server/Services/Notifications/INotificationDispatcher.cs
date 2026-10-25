namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Sends pending <see cref="Models.Entities.NotificationLog"/> rows and records the outcome.
/// </summary>
public interface INotificationDispatcher
{
    /// <summary>
    /// Sends up to one batch of pending notifications, marking each Sent or Failed.
    /// </summary>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The number of notifications processed.</returns>
    Task<int> DispatchPendingAsync(CancellationToken ct);
}
