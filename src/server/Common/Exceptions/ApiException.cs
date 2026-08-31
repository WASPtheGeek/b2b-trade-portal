namespace Elkaro.Server.Common.Exceptions;

/// <summary>
/// Custom exception class for API errors.
/// </summary>
public abstract class ApiException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ApiException"/> class with the specified status code, detail message, and optional title.
    /// </summary>
    /// <param name="statusCode">The HTTP status code of the error.</param>
    /// <param name="detail">The detail message of the error.</param>
    /// <param name="title">The optional title of the error.</param>
    protected ApiException(int statusCode, string detail, string? title = null) : base(detail)
    {
        StatusCode = statusCode;
        Title = title;
    }

    public int StatusCode { get; }
    public string? Title { get; }
}

/// <summary>
/// 401 — the caller's credentials are missing or invalid.
/// </summary>
public sealed class UnauthorizedException : ApiException
{
    public UnauthorizedException(string detail, string? title = null)
        : base(StatusCodes.Status401Unauthorized, detail, title) { }
}

/// <summary>
/// 403 — the caller is authenticated but not allowed to do this.
/// </summary>
public sealed class ForbiddenException : ApiException
{
    public ForbiddenException(string detail, string? title = null)
        : base(StatusCodes.Status403Forbidden, detail, title) { }
}

/// <summary>
/// 500 — a server-side precondition wasn't met (e.g. missing seed data).
/// </summary>
public sealed class InternalServerException : ApiException
{
    public InternalServerException(string detail, string? title = null)
        : base(StatusCodes.Status500InternalServerError, detail, title) { }
}

/// <summary>
/// 404 — the requested resource doesn't exist.
/// </summary>
public sealed class ResourceNotFoundException : ApiException
{
    public ResourceNotFoundException(string detail, string? title = null)
        : base(StatusCodes.Status404NotFound, detail, title) { }
}

/// <summary>
/// 400 — the request is malformed or fails a validation rule.
/// </summary>
public sealed class BadRequestException : ApiException
{
    public BadRequestException(string detail, string? title = null)
        : base(StatusCodes.Status400BadRequest, detail, title) { }
}

/// <summary>
/// 409 — the request conflicts with the current state of a resource (e.g. a duplicate key).
/// </summary>
public sealed class ConflictException : ApiException
{
    public ConflictException(string detail, string? title = null)
        : base(StatusCodes.Status409Conflict, detail, title) { }
}
