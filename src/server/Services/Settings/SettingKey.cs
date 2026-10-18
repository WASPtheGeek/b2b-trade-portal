namespace Elkaro.Server.Services.Settings;

/// <summary>
/// Identifies a settings group stored in <c>app_settings</c> and the type its JSON maps to.
/// <typeparamref name="T"/>'s property initializers are the defaults used for a missing row or
/// missing property, so adding a setting never needs a migration.
/// </summary>
/// <typeparam name="T">The settings group type.</typeparam>
/// <param name="Key">The <c>app_settings.key</c> of the group.</param>
public sealed record SettingKey<T>(string Key)
    where T : class, new();
