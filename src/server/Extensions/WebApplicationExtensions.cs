using Scalar.AspNetCore;

namespace Elkaro.Server.Extensions;

/// <summary>
/// Extension methods for configuring the web application pipeline.
/// </summary>
public static class WebApplicationExtensions
{
    /// <summary>
    /// Wires up development tools (Scalar OpenAPI and Scalar API Reference) if the environment is Development.
    /// </summary>
    /// <param name="app"></param>
    /// <returns></returns>
    public static WebApplication UseDevelopmentTools(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.MapScalarApiReference();
        }

        return app;
    }

    /// <summary>
    /// Wires up the request pipeline: exception handling, HTTPS
    /// redirection, CORS, auth, and controller routing, in the order that matters.
    /// </summary>
    public static WebApplication UseRequestPipeline(this WebApplication app)
    {
        app.UseExceptionHandler(); // pairs with AddProblemDetails() in AddWebApi()
        app.UseHttpsRedirection();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        return app;
    }
}
