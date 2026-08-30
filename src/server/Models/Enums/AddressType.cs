namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The type of an address record (billing or shipping).
/// Stored as a SMALLINT in Database.
/// </summary>
public enum AddressType
{
    /// <summary>
    /// A billing address.
    /// </summary>
    Billing = 1,

    /// <summary>
    /// A shipping address.
    /// </summary>
    Shipping = 2,
}
