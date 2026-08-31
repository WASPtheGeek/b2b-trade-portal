using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>Elkaro's own public contact info (support line, head office
/// address, etc.) — admin-managed, not per-customer. See schema Section 7.</summary>
public class CompanyContact
{
    /// <summary>
    /// Gets or sets the unique identifier for the contact entry.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the type of contact information this entry represents.
    /// </summary>
    public ContactType ContactType { get; set; }

    /// <summary>
    /// Gets or sets the display label for the contact entry, if any.
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the contact value (e.g. phone number or email address), if applicable.
    /// </summary>
    public string? ValueText { get; set; }

    /// <summary>
    /// Gets or sets the first line of the address, if applicable.
    /// </summary>
    public string? Line1 { get; set; }

    /// <summary>
    /// Gets or sets the second line of the address, if applicable.
    /// </summary>
    public string? Line2 { get; set; }

    /// <summary>
    /// Gets or sets the city, if applicable.
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// Gets or sets the region or state, if applicable.
    /// </summary>
    public string? Region { get; set; }

    /// <summary>
    /// Gets or sets the postal code, if applicable.
    /// </summary>
    public string? PostalCode { get; set; }

    /// <summary>
    /// Gets or sets the ISO country code, if applicable.
    /// </summary>
    public string? CountryCode { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is the primary contact entry of its type.
    /// </summary>
    public bool IsPrimary { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the contact entry is currently active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the sort order of the contact entry.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the contact entry was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the contact entry was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}
