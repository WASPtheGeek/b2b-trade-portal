namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a VAT rate applicable to products over a date range.
/// </summary>
public class VatRate
{
    /// <summary>
    /// Gets or sets the unique identifier for the VAT rate.
    /// </summary>
    public short Id { get; set; }

    /// <summary>
    /// Gets or sets the VAT rate as a percentage (e.g. 21.00 for 21%).
    /// </summary>
    public decimal Rate { get; set; }

    /// <summary>
    /// Gets or sets the display label for the VAT rate.
    /// </summary>
    public string Label { get; set; } = null!;

    /// <summary>
    /// Gets or sets a value indicating whether this is the default VAT rate for new products.
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Gets or sets the date from which the VAT rate applies.
    /// </summary>
    public DateOnly ValidFrom { get; set; }

    /// <summary>
    /// Gets or sets the date until which the VAT rate applies, if it has an end date.
    /// </summary>
    public DateOnly? ValidTo { get; set; }
}
