using System;
using System.Collections.Generic;

namespace server.Data.Entities;

public partial class OrderAddress
{
    public long Id { get; set; }

    public long OrderId { get; set; }

    public short AddressType { get; set; }

    public long? SourceAddressId { get; set; }

    public string? ContactName { get; set; }

    public string? BusinessName { get; set; }

    public string? RegistrationNumber { get; set; }

    public string? VatNumber { get; set; }

    public string Line1 { get; set; } = null!;

    public string? Line2 { get; set; }

    public string City { get; set; } = null!;

    public string? Region { get; set; }

    public string PostalCode { get; set; } = null!;

    public string CountryCode { get; set; } = null!;

    public string? Phone { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual UserAddress? SourceAddress { get; set; }
}
