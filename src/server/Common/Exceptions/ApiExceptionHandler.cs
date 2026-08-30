using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Elkaro.Server.Common.Exceptions;

/// <summary>
/// Registered via AddExceptionHandler in Program.cs, paired with UseExceptionHandler().
/// Converts a thrown <see cref="ApiException"/> into its matching ProblemDetails response;
/// any other exception type returns false so the default AddProblemDetails() handler deals with it.
/// </summary>
public sealed class ApiExceptionHandler : IExceptionHandler
{
    /// <inheritdoc />
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not ApiException apiException) return false;

        httpContext.Response.StatusCode = apiException.StatusCode;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Title = apiException.Title ?? "Pieprasījums neizdevās",
            Detail = apiException.Message,
            Status = apiException.StatusCode,
        }, cancellationToken);

        return true;
    }
}
