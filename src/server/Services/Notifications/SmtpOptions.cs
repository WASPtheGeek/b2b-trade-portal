namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// SMTP connection settings, bound from the "Smtp" configuration section. When
/// <see cref="Host"/> is empty, <see cref="LoggingEmailSender"/> is used instead.
/// </summary>
public class SmtpOptions
{
    /// <summary>
    /// Gets or sets the SMTP server host name.
    /// </summary>
    public string? Host { get; set; }

    /// <summary>
    /// Gets or sets the SMTP server port (587 for STARTTLS, 465 for implicit TLS).
    /// </summary>
    public int Port { get; set; } = 587;

    /// <summary>
    /// Gets or sets the SMTP user name; leave empty for servers without authentication.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets the SMTP password or API key.
    /// </summary>
    public string? Password { get; set; }

    /// <summary>
    /// Gets or sets the TLS mode: "Auto", "None", "SslOnConnect", "StartTls" or "StartTlsWhenAvailable".
    /// </summary>
    public string Security { get; set; } = "Auto";

    /// <summary>
    /// Gets or sets the sender email address.
    /// </summary>
    public string FromAddress { get; set; } = null!;

    /// <summary>
    /// Gets or sets the sender display name.
    /// </summary>
    public string FromName { get; set; } = "Elkaro";
}
