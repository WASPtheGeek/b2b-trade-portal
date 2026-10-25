namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Outbox dispatch settings, bound from the "Notifications" configuration section.
/// </summary>
public class NotificationOptions
{
    /// <summary>
    /// Gets or sets how often the outbox is polled for pending notifications, in seconds.
    /// </summary>
    public int PollIntervalSeconds { get; set; } = 15;

    /// <summary>
    /// Gets or sets the maximum number of notifications sent per poll.
    /// </summary>
    public int BatchSize { get; set; } = 20;

    /// <summary>
    /// Gets or sets the public base URL of the web client, used to build links in emails (optional).
    /// </summary>
    public string? ClientBaseUrl { get; set; }
}
