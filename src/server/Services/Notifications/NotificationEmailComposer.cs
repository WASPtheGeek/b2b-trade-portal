using System.Globalization;
using System.Net;
using System.Text;
using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Composes the Latvian-language emails for each <see cref="NotificationTypes"/> value.
/// </summary>
public class NotificationEmailComposer : INotificationEmailComposer
{
    private static readonly CultureInfo Lv = CultureInfo.GetCultureInfo("lv-LV");

    private readonly ElkaroDbContext _db;
    private readonly NotificationOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationEmailComposer"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="options">The notification options.</param>
    public NotificationEmailComposer(ElkaroDbContext db, IOptions<NotificationOptions> options)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _options = Guard.Against.Null(options, nameof(options)).Value;
    }

    /// <inheritdoc/>
    public async Task<EmailMessage> ComposeAsync(NotificationLog notification, CancellationToken ct)
    {
        return notification.NotificationType switch
        {
            NotificationTypes.OrderCreatedAdminAlert =>
                ComposeOrderAdminAlert(notification.RecipientEmail, await LoadOrderAsync(notification, ct)),
            NotificationTypes.OrderCreatedClientConfirmation =>
                ComposeOrderClientConfirmation(notification.RecipientEmail, await LoadOrderAsync(notification, ct)),
            NotificationTypes.BusinessRegistrationRequest =>
                ComposeRegistrationRequest(notification.RecipientEmail, await LoadUserAsync(notification, ct)),
            _ => throw new InvalidOperationException(
                $"Unknown notification type '{notification.NotificationType}'."),
        };
    }

    /// <summary>
    /// Builds the admin alert for a newly placed order.
    /// </summary>
    /// <param name="to">The admin's email address.</param>
    /// <param name="order">The order, with its user and items loaded.</param>
    /// <returns>The composed <see cref="EmailMessage"/>.</returns>
    private EmailMessage ComposeOrderAdminAlert(string to, Order order)
    {
        var customer = order.User.BusinessName ?? $"{order.User.FirstName} {order.User.LastName}";
        var subject = $"Jauns pasūtījums {order.OrderNumber} – {customer}";

        var lines = new List<(string Label, string Value)>
        {
            ("Pasūtījuma nr.", order.OrderNumber),
            ("Klients", customer),
            ("Kontaktpersona", $"{order.User.FirstName} {order.User.LastName}"),
            ("E-pasts", order.User.Email),
            ("Tālrunis", order.User.Phone ?? "–"),
            ("Pozīcijas", order.Items.Count.ToString(Lv)),
            ("Summa bez PVN", FormatMoney(order.SubtotalAmount, order.Currency)),
            ("Kopā ar PVN", FormatMoney(order.TotalAmount, order.Currency)),
            ("Piezīmes", order.Notes ?? "–"),
        };

        return Build(to, subject, "Saņemts jauns pasūtījums.", lines, Link("/admin/orders"));
    }

    /// <summary>
    /// Builds the confirmation sent to the business that placed the order.
    /// </summary>
    /// <param name="to">The client's email address.</param>
    /// <param name="order">The order, with its user and items loaded.</param>
    /// <returns>The composed <see cref="EmailMessage"/>.</returns>
    private EmailMessage ComposeOrderClientConfirmation(string to, Order order)
    {
        var subject = $"Jūsu pasūtījums {order.OrderNumber} ir saņemts";

        var lines = new List<(string Label, string Value)>
        {
            ("Pasūtījuma nr.", order.OrderNumber),
            ("Pozīcijas", order.Items.Count.ToString(Lv)),
            ("Kopā ar PVN", FormatMoney(order.TotalAmount, order.Currency)),
        };

        return Build(
            to,
            subject,
            "Paldies! Esam saņēmuši jūsu pasūtījumu un sazināsimies, tiklīdz tas tiks apstrādāts.",
            lines,
            Link("/orders"));
    }

    /// <summary>
    /// Builds the admin alert for a business account awaiting approval.
    /// </summary>
    /// <param name="to">The admin's email address.</param>
    /// <param name="user">The registering user.</param>
    /// <returns>The composed <see cref="EmailMessage"/>.</returns>
    private EmailMessage ComposeRegistrationRequest(string to, User user)
    {
        var name = user.BusinessName ?? $"{user.FirstName} {user.LastName}";
        var subject = $"Jauns konta pieteikums – {name}";

        var lines = new List<(string Label, string Value)>
        {
            ("Uzņēmums", user.BusinessName ?? "–"),
            ("Reģ. nr.", user.RegistrationNumber ?? "–"),
            ("PVN nr.", user.VatNumber ?? "–"),
            ("Kontaktpersona", $"{user.FirstName} {user.LastName}"),
            ("E-pasts", user.Email),
            ("Tālrunis", user.Phone ?? "–"),
        };

        return Build(to, subject, "Jauns biznesa konts gaida apstiprinājumu.", lines, Link("/admin/users"));
    }

    /// <summary>
    /// Loads the order referenced by a notification, including its user and items.
    /// </summary>
    /// <param name="notification">The outbox row.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The related <see cref="Order"/>.</returns>
    private async Task<Order> LoadOrderAsync(NotificationLog notification, CancellationToken ct)
    {
        var order = notification.RelatedOrderId is { } orderId
            ? await _db.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            : null;

        return order ?? throw new InvalidOperationException(
            $"Order {notification.RelatedOrderId} for notification {notification.Id} not found.");
    }

    /// <summary>
    /// Loads the user referenced by a notification.
    /// </summary>
    /// <param name="notification">The outbox row.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The related <see cref="User"/>.</returns>
    private async Task<User> LoadUserAsync(NotificationLog notification, CancellationToken ct)
    {
        var user = notification.RelatedUserId is { } userId
            ? await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct)
            : null;

        return user ?? throw new InvalidOperationException(
            $"User {notification.RelatedUserId} for notification {notification.Id} not found.");
    }

    /// <summary>
    /// Renders an intro paragraph, a label/value table and an optional link as HTML and plain text.
    /// </summary>
    /// <param name="to">The recipient email address.</param>
    /// <param name="subject">The subject line.</param>
    /// <param name="intro">The opening sentence.</param>
    /// <param name="lines">The label/value rows to display.</param>
    /// <param name="link">The absolute link to the relevant page, or null if no base URL is configured.</param>
    /// <returns>The composed <see cref="EmailMessage"/>.</returns>
    private static EmailMessage Build(
        string to,
        string subject,
        string intro,
        IReadOnlyList<(string Label, string Value)> lines,
        string? link)
    {
        var html = new StringBuilder();
        var text = new StringBuilder();

        html.Append("<div style=\"font-family:Arial,sans-serif;font-size:14px;color:#222\">");
        html.Append($"<p>{Encode(intro)}</p><table cellpadding=\"4\" style=\"border-collapse:collapse\">");
        text.AppendLine(intro).AppendLine();

        foreach (var (label, value) in lines)
        {
            html.Append($"<tr><td style=\"color:#666\">{Encode(label)}</td><td><b>{Encode(value)}</b></td></tr>");
            text.AppendLine($"{label}: {value}");
        }

        html.Append("</table>");

        if (link is not null)
        {
            html.Append($"<p><a href=\"{Encode(link)}\">Atvērt portālā</a></p>");
            text.AppendLine().AppendLine(link);
        }

        html.Append("</div>");

        return new EmailMessage(to, subject, html.ToString(), text.ToString());
    }

    /// <summary>
    /// Builds an absolute link into the web client, if <see cref="NotificationOptions.ClientBaseUrl"/> is set.
    /// </summary>
    /// <param name="path">The client-side path, starting with "/".</param>
    /// <returns>The absolute URL, or null if no base URL is configured.</returns>
    private string? Link(string path) =>
        string.IsNullOrWhiteSpace(_options.ClientBaseUrl) ? null : _options.ClientBaseUrl.TrimEnd('/') + path;

    /// <summary>
    /// Formats a money amount for display, e.g. "1 234,50 EUR".
    /// </summary>
    /// <param name="amount">The amount.</param>
    /// <param name="currency">The ISO currency code.</param>
    /// <returns>The formatted amount.</returns>
    private static string FormatMoney(decimal amount, string currency) =>
        $"{amount.ToString("N2", Lv)} {currency}";

    /// <summary>
    /// HTML-encodes user-supplied text before embedding it in the email body.
    /// </summary>
    /// <param name="value">The raw text.</param>
    /// <returns>The encoded text.</returns>
    private static string Encode(string value) => WebUtility.HtmlEncode(value);
}
