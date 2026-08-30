using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Frozen copy of the address at time of purchase — deliberately not just a
/// FK to user_addresses, since that row can later be edited/deleted. See
/// schema design note 4.
/// </summary>
public class OrderAddress
{
    /// <summary>
    /// Gets or sets the unique identifier for the order address.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the order this address belongs to.
    /// </summary>
    public long OrderId { get; set; }

    /// <summary>
    /// Gets or sets the order this address belongs to.
    /// </summary>
    public Order Order { get; set; } = null!;

    /// <summary>
    /// Gets or sets the type of address (e.g. billing or shipping).
    /// </summary>
    public AddressType AddressType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user address this was copied from, if any.
    /// </summary>
    public long? SourceAddressId { get; set; }

    /// <summary>
    /// Gets or sets the contact name for this address, if any.
    /// </summary>
    public string? ContactName { get; set; }

    /// <summary>
    /// Gets or sets the business name for this address, if any.
    /// </summary>
    public string? BusinessName { get; set; }

    /// <summary>
    /// Gets or sets the business registration number for this address, if any.
    /// </summary>
    public string? RegistrationNumber { get; set; }

    /// <summary>
    /// Gets or sets the VAT number for this address, if any.
    /// </summary>
    public string? VatNumber { get; set; }

    /// <summary>
    /// Gets or sets the first line of the address.
    /// </summary>
    public string Line1 { get; set; } = null!;

    /// <summary>
    /// Gets or sets the second line of the address, if any.
    /// </summary>
    public string? Line2 { get; set; }

    /// <summary>
    /// Gets or sets the city.
    /// </summary>
    public string City { get; set; } = null!;

    /// <summary>
    /// Gets or sets the region or state, if any.
    /// </summary>
    public string? Region { get; set; }

    /// <summary>
    /// Gets or sets the postal code.
    /// </summary>
    public string PostalCode { get; set; } = null!;

    /// <summary>
    /// Gets or sets the ISO country code.
    /// </summary>
    public string CountryCode { get; set; } = null!;

    /// <summary>
    /// Gets or sets the contact phone number for this address, if any.
    /// </summary>
    public string? Phone { get; set; }
}
