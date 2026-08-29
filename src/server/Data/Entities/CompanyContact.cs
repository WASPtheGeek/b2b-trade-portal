using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class CompanyContact
{
    public long Id { get; set; }

    public short ContactType { get; set; }

    public string? Label { get; set; }

    public string? ValueText { get; set; }

    public string? Line1 { get; set; }

    public string? Line2 { get; set; }

    public string? City { get; set; }

    public string? Region { get; set; }

    public string? PostalCode { get; set; }

    public string? CountryCode { get; set; }

    public bool IsPrimary { get; set; }

    public bool IsActive { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
