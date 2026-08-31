namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The data type of a product attribute's value.
/// Stored as a SMALLINT in Database.
/// </summary>
public enum AttributeDataType
{
    /// <summary>
    /// Free text.
    /// </summary>
    Text = 1,

    /// <summary>
    /// A numeric value.
    /// </summary>
    Number = 2,

    /// <summary>
    /// A true/false value.
    /// </summary>
    Boolean = 3,

    /// <summary>
    /// A date value.
    /// </summary>
    Date = 4,
}
