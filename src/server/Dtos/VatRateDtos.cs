namespace Elkaro.Server.Dtos;

/// <summary>
/// Represents a VAT rate option available to assign to a product.
/// </summary>
/// <param name="Id">The unique identifier of the VAT rate.</param>
/// <param name="Rate">The VAT rate as a percentage (e.g. 21.00 for 21%).</param>
/// <param name="Label">The display label of the VAT rate.</param>
/// <param name="IsDefault">Indicates whether this is the default VAT rate for new products.</param>
public record VatRateDto(short Id, decimal Rate, string Label, bool IsDefault);
