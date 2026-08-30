namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The kind of value a CompanyContact entry holds. 
/// Stored as a SMALLINT in Database.
/// </summary>
public enum ContactType
{
    /// <summary>
    /// A phone number.
    /// </summary>
    Phone = 1,

    /// <summary>
    /// An email address.
    /// </summary>
    Email = 2,

    /// <summary>
    /// A physical address.
    /// </summary>
    Address = 3,

    /// <summary>
    /// A business registration number.
    /// </summary>
    RegistrationNumber = 4,
}
