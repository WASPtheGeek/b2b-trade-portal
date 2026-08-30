using Elkaro.Server.Models.Entities;

namespace Elkaro.Server.Services;

/// <summary>
/// Defines a service for creating JWT access tokens for authenticated users.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Creates a JWT access token for the specified user and role.
    /// </summary>
    /// <param name="user">The user for whom the access token is being created.</param>
    /// <param name="roleName">The role of the user.</param>
    /// <returns>The generated JWT access token.</returns>
    string CreateAccessToken(User user, string roleName);
}
