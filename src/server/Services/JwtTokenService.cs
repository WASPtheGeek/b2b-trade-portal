using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Elkaro.Server.Models.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Elkaro.Server.Services;

/// <summary>
/// Represents the options for configuring JWT token generation.
/// </summary>
public class JwtOptions
{
    /// <summary>
    /// Gets or sets the issuer of the JWT token.
    /// </summary>
    public string Issuer { get; set; } = null!;

    /// <summary>
    /// Gets or sets the audience for the JWT token.
    /// </summary>
    public string Audience { get; set; } = null!;

    /// <summary>
    /// Gets or sets the signing key used to sign the JWT token.
    /// </summary>
    public string SigningKey { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lifetime of the access token in minutes.
    /// </summary>
    public int AccessTokenLifetimeMinutes { get; set; } = 480;
}

/// <summary>
/// Provides functionality for creating JWT access tokens for authenticated users.
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="JwtTokenService"/> class with the specified JWT options.
    /// </summary>
    /// <param name="options">The JWT options.</param>
    public JwtTokenService(Microsoft.Extensions.Options.IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    /// <inheritdoc/>
    public string CreateAccessToken(User user, string roleName)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, roleName),
            new("business_name", user.BusinessName ?? string.Empty),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.AccessTokenLifetimeMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
