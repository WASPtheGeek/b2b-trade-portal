namespace Elkaro.Server.Models.Enums;

/// <summary>
/// The fixed set of roles a user account can have, matching the seeded rows in the
/// <c>roles</c> table (see b2b_ecommerce_schema.sql §9). Roles are still modeled as a
/// database lookup table (<see cref="Entities.Role"/>, <see cref="Entities.User.RoleId"/>)
/// rather than a plain SMALLINT+CHECK column like this project's other "enum-like" columns
/// (see the schema's §1 type code reference), since <see cref="Constants.RoleNames"/> and
/// ASP.NET's own <c>[Authorize(Roles = "...")]</c> attributes key off the role's name
/// string, not a numeric id. This enum exists purely so C# code can refer to a role as a
/// type-safe, compile-checked value instead of a magic string - see
/// <see cref="UserRoleExtensions"/> for the conversion to/from that name string.
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Full data management capabilities.
    /// </summary>
    Admin = 1,

    /// <summary>
    /// Approved B2B client account.
    /// </summary>
    Business = 2,
}
