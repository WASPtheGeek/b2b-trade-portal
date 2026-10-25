using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Drains the <c>notification_log</c> outbox: composes and sends each pending row, then marks it
/// <see cref="NotificationStatus.Sent"/> or <see cref="NotificationStatus.Failed"/>. Rows are
/// written by Postgres triggers in the same transaction as the order/user insert, so a
/// notification is never lost even if the mail server is down when the order is placed.
/// </summary>
public class NotificationDispatcher : INotificationDispatcher
{
    private const int MaxErrorLength = 500;

    private readonly ElkaroDbContext _db;
    private readonly INotificationEmailComposer _composer;
    private readonly IEmailSender _sender;
    private readonly NotificationOptions _options;
    private readonly ILogger<NotificationDispatcher> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationDispatcher"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="composer">The email composer.</param>
    /// <param name="sender">The email transport.</param>
    /// <param name="options">The notification options.</param>
    /// <param name="logger">The logger instance.</param>
    public NotificationDispatcher(
        ElkaroDbContext db,
        INotificationEmailComposer composer,
        IEmailSender sender,
        IOptions<NotificationOptions> options,
        ILogger<NotificationDispatcher> logger)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _composer = Guard.Against.Null(composer, nameof(composer));
        _sender = Guard.Against.Null(sender, nameof(sender));
        _options = Guard.Against.Null(options, nameof(options)).Value;
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <inheritdoc/>
    public async Task<int> DispatchPendingAsync(CancellationToken ct)
    {
        var pending = await _db.NotificationLogs
            .Where(n => n.Status == NotificationStatus.Pending)
            .OrderBy(n => n.Id)
            .Take(_options.BatchSize)
            .ToListAsync(ct);

        foreach (var notification in pending)
        {
            try
            {
                var message = await _composer.ComposeAsync(notification, ct);
                await _sender.SendAsync(message, ct);

                notification.Status = NotificationStatus.Sent;
                notification.SentAt = DateTimeOffset.UtcNow;
                notification.ErrorMessage = null;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Failed to send notification {NotificationId}", notification.Id);

                notification.Status = NotificationStatus.Failed;
                notification.ErrorMessage = ex.Message.Length > MaxErrorLength
                    ? ex.Message[..MaxErrorLength]
                    : ex.Message;
            }

            // Save per row so a crash mid-batch doesn't re-send emails that already went out.
            await _db.SaveChangesAsync(ct);
        }

        return pending.Count;
    }
}
