using System.Text.Json;
using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Services.Settings;

/// <summary>
/// <see cref="IAppSettingsService"/> backed by the <c>app_settings</c> table.
/// </summary>
public class AppSettingsService : IAppSettingsService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ElkaroDbContext _db;
    private readonly ILogger<AppSettingsService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AppSettingsService"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    public AppSettingsService(ElkaroDbContext db, ILogger<AppSettingsService> logger)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <inheritdoc/>
    public async Task<T> GetAsync<T>(SettingKey<T> key, CancellationToken ct = default)
        where T : class, new()
    {
        var json = await _db.AppSettings
            .Where(s => s.Key == key.Key)
            .Select(s => s.ValueJson)
            .FirstOrDefaultAsync(ct);

        if (json is null)
        {
            return new T();
        }

        try
        {
            // Properties absent from the stored JSON keep T's initializer defaults.
            return JsonSerializer.Deserialize<T>(json, JsonOptions) ?? new T();
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Setting {Key} has invalid JSON — using defaults", key.Key);
            return new T();
        }
    }

    /// <inheritdoc/>
    public async Task SaveAsync<T>(SettingKey<T> key, T value, long? updatedBy, CancellationToken ct = default)
        where T : class, new()
    {
        var json = JsonSerializer.Serialize(value, JsonOptions);
        var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == key.Key, ct);

        if (setting is null)
        {
            _db.AppSettings.Add(new AppSetting { Key = key.Key, ValueJson = json, UpdatedBy = updatedBy });
        }
        else
        {
            setting.ValueJson = json;
            setting.UpdatedBy = updatedBy;
        }

        await _db.SaveChangesAsync(ct);
    }

    /// <inheritdoc/>
    public async Task ResetAsync<T>(SettingKey<T> key, CancellationToken ct = default)
        where T : class, new() =>
        await _db.AppSettings.Where(s => s.Key == key.Key).ExecuteDeleteAsync(ct);
}
