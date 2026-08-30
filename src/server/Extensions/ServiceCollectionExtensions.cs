using System.Text;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Services;
using Elkaro.Server.Services.Import;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

namespace Elkaro.Server.Extensions;

/// <summary>
/// Extension methods for configuring services in the application's dependency injection container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>R
    /// egisters the OpenAPI document and its JWT Bearer security scheme,
    /// so Scalar shows a single document-wide "Authorize" control instead of requiring
    /// the token to be re-entered on every endpoint's Test Request panel.
    /// </summary>
    public static IServiceCollection AddOpenApiDocumentation(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                var components = document.Components ??= new OpenApiComponents();
                var securitySchemes = components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
                securitySchemes["Bearer"] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                };

                document.Security ??= new List<OpenApiSecurityRequirement>();
                document.Security.Add(new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("Bearer", document, null)] = new List<string>(),
                });

                return Task.CompletedTask;
            });
        });

        return services;
    }

    /// <summary>
    /// Wires up the Postgres-backed EF Core context.
    /// </summary>
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ElkaroDbContext>(options => options.UseNpgsql(connectionString));

        return services;
    }

    /// <summary>
    /// Registers the password hasher plus JWT authentication/authorization,
    /// bound from the "Jwt" configuration section.
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<PasswordHasher<User>>();

        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        var jwtOptions = configuration.GetSection("Jwt").Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration section is missing.");

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy("AdminOnly", policy => policy.RequireRole(RoleNames.Admin));

        return services;
    }

    /// <summary>
    /// Registers the app's own scoped services (current-user access, JWT
    /// issuing, pricing, order numbering) that controllers depend on.
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPricingService, PricingService>();
        services.AddScoped<IOrderNumberGenerator, OrderNumberGenerator>();

        return services;
    }

    /// <summary>
    /// Registers the CSV/XLSX product import pipeline (async, off the
    /// request thread — see claude/api-design.md §5 and Services/Import/ImportBackgroundService.cs).
    /// </summary>
    public static IServiceCollection AddImportPipeline(this IServiceCollection services)
    {
        services.AddSingleton<IImportJobQueue, ImportJobQueue>();
        services.AddSingleton<ImportFileParserResolver>();
        services.AddSingleton<IImportFileParser, CsvProductImportFileParser>();
        services.AddSingleton<IImportFileParser, XlsxProductImportFileParser>();
        services.AddScoped<ImportBatchProcessor>();
        services.AddHostedService<ImportBackgroundService>();

        return services;
    }

    /// <summary>
    /// Registers MVC controllers and the exception handler
    /// that converts ApiException-derived exceptions into RFC 7807-compliant ProblemDetails responses
    /// (JSON responses with "type", "title", "status", and "detail" fields). 
    /// </summary>
    public static IServiceCollection AddWebApi(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddExceptionHandler<ApiExceptionHandler>();
        services.AddProblemDetails();

        return services;
    }

    /// <summary>
    /// Registers the default CORS policy from the "Cors:AllowedOrigins" configuration.
    /// </summary>
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        var corsOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                if (corsOrigins.Length > 0)
                    policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
            });
        });

        return services;
    }
}
