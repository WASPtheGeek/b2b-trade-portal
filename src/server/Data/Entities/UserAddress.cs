using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class UserAddress
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public short AddressType { get; set; }

    public string? Label { get; set; }

    public string? ContactName { get; set; }

    public string Line1 { get; set; } = null!;

    public string? Line2 { get; set; }

    public string City { get; set; } = null!;

    public string? Region { get; set; }

    public string PostalCode { get; set; } = null!;

    public string CountryCode { get; set; } = null!;

    public string? Phone { get; set; }

    public bool IsDefault { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<OrderAddress> OrderAddresses { get; set; } = new List<OrderAddress>();

    public virtual User User { get; set; } = null!;
}
