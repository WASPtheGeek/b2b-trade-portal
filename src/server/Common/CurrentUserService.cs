using System.Security.Claims;
using Ardalis.GuardClauses;
using Elkaro.Server.Models.Enums;

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
    /// Gets the role name of the currently authenticated user (e.g. "admin"), or null if the
    /// user is not authenticated. This is the raw JWT claim value - prefer <see cref="UserRole"/>
    /// for a type-safe check; this remains mainly for passing through to APIs (logging,
    /// <c>ToDto</c> projections) that still want the plain string.
    /// </summary>
    string? Role { get; }

    /// <summary>
    /// Gets the role of the currently authenticated user as a <see cref="UserRole"/>, or
    /// null if the user is not authenticated or its role claim doesn't match a known role.
    /// </summary>
    UserRole? UserRole { get; }

    /// <summary>
    /// Gets a value indicating whether the currently authenticated user is an administrator.
    /// </summary>
    bool IsAdmin { get; }

    /// <summary>
    /// Gets a value indicating whether the currently authenticated user's account is approved
    /// (or an admin, for whom the concept doesn't apply). A logged-in business account can be
    /// Pending or Rejected - see <see cref="Controllers.AuthController"/>'s login policy - and
    /// this is what gates pricing/ordering for those restricted sessions, the same way
    /// <see cref="IsAuthenticated"/> gates them for guests.
    /// </summary>
    bool IsApproved { get; }
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
    /// Gets the role name of the currently authenticated user, or null if the user is not authenticated.
    /// </summary>
    public string? Role => Principal?.FindFirstValue(ClaimTypes.Role);

    /// <summary>
    /// Gets the role of the currently authenticated user as a <see cref="UserRole"/>, or null if
    /// the user is not authenticated or its role claim doesn't match a known role.
    /// </summary>
    public UserRole? UserRole => UserRoleExtensions.TryParseRoleName(Role, out var role) ? role : null;

    /// <summary>
    /// Gets a value indicating whether the currently authenticated user is an administrator.
    /// </summary>
    public bool IsAdmin => UserRole == Models.Enums.UserRole.Admin;

    /// <summary>
    /// Gets a value indicating whether the currently authenticated user's account is approved.
    /// </summary>
    public bool IsApproved =>
        IsAdmin || string.Equals(Principal?.FindFirstValue("status"), nameof(UserStatus.Approved), StringComparison.OrdinalIgnoreCase);
}
