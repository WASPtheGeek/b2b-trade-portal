using Elkaro.Server.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApiDocumentation();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddImportPipeline();
builder.Services.AddWebApi();
builder.Services.AddCorsPolicy(builder.Configuration);

var app = builder.Build();

app.UseDevelopmentTools();
app.UseRequestPipeline();

app.Run();

// For the integration tests.
public partial class Program { }
