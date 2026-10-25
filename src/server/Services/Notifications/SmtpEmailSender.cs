using Ardalis.GuardClauses;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Sends email over SMTP using MailKit. Works with any SMTP relay (Gmail/Workspace,
/// Microsoft 365, SendGrid, Mailgun, Amazon SES, Brevo, a local Mailpit, ...).
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="SmtpEmailSender"/> class.
    /// </summary>
    /// <param name="options">The SMTP options.</param>
    public SmtpEmailSender(IOptions<SmtpOptions> options)
    {
        _options = Guard.Against.Null(options, nameof(options)).Value;
    }

    /// <inheritdoc/>
    public async Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
        mime.To.Add(MailboxAddress.Parse(message.To));
        mime.Subject = message.Subject;
        mime.Body = new BodyBuilder
        {
            HtmlBody = message.HtmlBody,
            TextBody = message.TextBody,
        }.ToMessageBody();

        var security = Enum.Parse<SecureSocketOptions>(_options.Security, ignoreCase: true);

        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, security, ct);

        if (!string.IsNullOrEmpty(_options.Username))
        {
            await client.AuthenticateAsync(_options.Username, _options.Password, ct);
        }

        await client.SendAsync(mime, ct);
        await client.DisconnectAsync(true, ct);
    }
}
