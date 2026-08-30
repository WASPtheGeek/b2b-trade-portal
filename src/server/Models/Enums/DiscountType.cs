namespace Elkaro.Server.Models.Enums;

/// <summary>
/// How a promotion's DiscountValue is interpreted. Stored as a SMALLINT in
/// Postgres — mirrors the "TYPE CODE REFERENCE" comment block in
/// b2b_ecommerce_schema.sql Section 1. Keep in sync by hand; there is
/// no DB-level enum type backing this.
/// </summary>
public enum DiscountType
{
    /// <summary>The discount value is a percentage off.</summary>
    Percentage = 1,

    /// <summary>The discount value is a fixed amount off.</summary>
    FixedAmount = 2,
}
