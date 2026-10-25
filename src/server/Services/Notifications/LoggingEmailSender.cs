using Ardalis.GuardClauses;

namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Development fallback used when no SMTP host is configured: writes the email to the log
/// instead of sending it, so the outbox still drains and the content can be inspected.
/// </summary>
public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="LoggingEmailSender"/> class.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
    {
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <inheritdoc/>
    public Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        _logger.LogInformation(
            "SMTP not configured; email not sent. To: {To}, Subject: {Subject}\n{Body}",
            message.To,
            message.Subject,
            message.TextBody);

        return Task.CompletedTask;
    }
}
