namespace Elkaro.Server.Models.Enums;

/// <summary>
/// Specifies the type of discount applied to a promotion or product.
/// </summary>
public enum DiscountType
{
    /// <summary>
    /// The discount value is a percentage off.
    /// </summary>
    Percentage = 1,

    /// <summary>
    /// The discount value is a fixed amount off.
    /// </summary>
    FixedAmount = 2,
}
