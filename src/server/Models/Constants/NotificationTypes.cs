namespace Elkaro.Server.Models.Constants;

/// <summary>
/// The <c>notification_type</c> values written into <c>notification_log</c> - most are
/// inserted automatically by database triggers (<c>trg_notify_admin_on_registration</c>,
/// <c>trg_notify_on_order_created</c> — see b2b_ecommerce_schema.sql) and kept in sync with
/// those trigger bodies by hand, since the values are plain strings on both sides.
/// <see cref="Controllers.AuthController"/> is the one exception, inserting
/// <see cref="BusinessRegistrationRequest"/> rows directly when a Rejected account resubmits,
/// since that trigger only fires on INSERT.
/// </summary>
public static class NotificationTypes
{
    /// <summary>
    /// Sent to every admin when a new business account self-registers and needs approval.
    /// </summary>
    public const string BusinessRegistrationRequest = "business_registration_request";

    /// <summary>
    /// Sent to every admin when a business account places a new order.
    /// </summary>
    public const string OrderCreatedAdminAlert = "order_created_admin_alert";

    /// <summary>
    /// Sent to the ordering business, confirming their order was received.
    /// </summary>
    public const string OrderCreatedClientConfirmation = "order_created_client_confirmation";
}
