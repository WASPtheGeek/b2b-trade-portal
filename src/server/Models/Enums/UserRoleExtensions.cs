using Elkaro.Server.Models.Constants;

namespace Elkaro.Server.Models.Enums;

/// <summary>
/// Conversions between <see cref="UserRole"/> and the role name strings the rest of the
/// codebase already works with - <c>roles.name</c> in the database, the JWT role claim, and
/// <see cref="RoleNames"/>'s constants (which <c>[Authorize(Roles = "...")]</c> attributes
/// need as compile-time string literals, so they can't be replaced by this enum directly).
/// </summary>
public static class UserRoleExtensions
{
    /// <summary>
    /// Converts a <see cref="UserRole"/> to its database/claim role name.
    /// </summary>
    /// <param name="role">The role to convert.</param>
    /// <returns>The role's name, e.g. "admin" or "business".</returns>
    public static string ToRoleName(this UserRole role) => role switch
    {
        UserRole.Admin => RoleNames.Admin,
        UserRole.Business => RoleNames.Business,
        _ => throw new ArgumentOutOfRangeException(nameof(role), role, "Unrecognized user role."),
    };

    /// <summary>
    /// Attempts to parse a role name (e.g. from <c>roles.name</c> or a JWT role claim) into a <see cref="UserRole"/>.
    /// </summary>
    /// <param name="roleName">The role name to parse.</param>
    /// <param name="role">
    /// When this method returns, contains the parsed <see cref="UserRole"/> value if the
    /// parsing succeeded, or the default value if it failed.
    /// </param>
    /// <returns><c>true</c> if the parsing succeeded; otherwise, <c>false</c>.</returns>
    public static bool TryParseRoleName(string? roleName, out UserRole role)
    {
        switch (roleName)
        {
            case RoleNames.Admin:
                role = UserRole.Admin;
                return true;
            case RoleNames.Business:
                role = UserRole.Business;
                return true;
            default:
                role = default;
                return false;
        }
    }
}
