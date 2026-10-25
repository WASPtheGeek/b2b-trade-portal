namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Delivers an <see cref="EmailMessage"/> through a concrete transport (SMTP, provider API, log).
/// </summary>
public interface IEmailSender
{
    /// <summary>
    /// Sends the given email.
    /// </summary>
    /// <param name="message">The email to send.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A task that completes once the message has been accepted by the transport.</returns>
    Task SendAsync(EmailMessage message, CancellationToken ct);
}
