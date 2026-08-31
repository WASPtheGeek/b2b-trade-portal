using System.Security.Claims;
using Ardalis.GuardClauses;
using Elkaro.Server.Models.Constants;

namespace Elkaro.Server.Common;

/// <summary>
/// Service for accessing information about the currently authenticated user.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets a value indicating whether the current user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Gets the user ID of the currently authenticated user, or null if the user is not authenticated.
    /// </summary>
    long? UserId { get; }

    /// <summary>
    /// Gets the role of the currently authenticated user, or null if the user is not authenticated.
    /// </summary>
    string? Role { get; }

    /// <summary>
    /// Gets a value indicating whether the currently authenticated user is an administrator.
    /// </summary>
    bool IsAdmin { get; }
}

/// <summary>
/// The <see cref="CurrentUserService"/> class provides access to information about the currently authenticated user.
/// Thin wrapper over ClaimsPrincipal so controllers/services don't each re-parse claims. 
/// Registered as scoped, backed by IHttpContextAccessor.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    /// <summary>
    /// The HTTP context accessor used to access the current HTTP context and retrieve user claims.
    /// </summary>
    private readonly IHttpContextAccessor _accessor;

    /// <summary>
    /// Initializes a new instance of the <see cref="CurrentUserService"/> class with the specified HTTP context accessor.
    /// </summary>
    /// <param name="accessor"></param>
    public CurrentUserService(IHttpContextAccessor accessor) => _accessor = Guard.Against.Null(accessor, nameof(accessor));

    /// <summary>
    /// Gets the <see cref="ClaimsPrincipal"/> representing the currently authenticated user, or null if no user is authenticated.
    /// </summary>
    private ClaimsPrincipal? Principal => _accessor.HttpContext?.User;

    /// <summary>
    /// Gets a value indicating whether the current user is authenticated.
    /// </summary>
    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

    /// <summary>
    /// Gets the user ID of the currently authenticated user, or null if the user is not authenticated.
    /// </summary>
    public long? UserId
    {
        get
        {
            var raw = Principal?.FindFirstValue(ClaimTypes.NameIdentifier);

            return long.TryParse(raw, out var id) ? id : null;
        }
    }

    /// <summary>
    /// Gets the role of the currently authenticated user, or null if the user is not authenticated.
    /// </summary>
    public string? Role => Principal?.FindFirstValue(ClaimTypes.Role);

    /// <summary>
    /// Gets a value indicating whether the currently authenticated user is an administrator.
    /// </summary>
    public bool IsAdmin => string.Equals(Role, RoleNames.Admin, StringComparison.OrdinalIgnoreCase);
}
