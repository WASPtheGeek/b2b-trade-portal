using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a saved address belonging to a user.
/// </summary>
public class UserAddress
{
    /// <summary>
    /// Gets or sets the unique identifier for the address.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user this address belongs to.
    /// </summary>
    public long UserId { get; set; }

    /// <summary>
    /// Gets or sets the user this address belongs to.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Gets or sets the type of address (e.g. billing or shipping).
    /// </summary>
    public AddressType AddressType { get; set; }

    /// <summary>
    /// Gets or sets the display label for the address, if any.
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the contact name for the address, if any.
    /// </summary>
    public string? ContactName { get; set; }

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
    /// Gets or sets the contact phone number for the address, if any.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is the user's default address of its type.
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the address was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the address was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}
