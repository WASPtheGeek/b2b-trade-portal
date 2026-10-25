namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// A transport-agnostic email ready to be sent by an <see cref="IEmailSender"/>.
/// </summary>
/// <param name="To">The recipient email address.</param>
/// <param name="Subject">The subject line.</param>
/// <param name="HtmlBody">The HTML body.</param>
/// <param name="TextBody">The plain-text alternative body.</param>
public record EmailMessage(string To, string Subject, string HtmlBody, string TextBody);
