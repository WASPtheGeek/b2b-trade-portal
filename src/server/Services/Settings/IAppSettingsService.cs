namespace Elkaro.Server.Services.Settings;

/// <summary>
/// Reads and saves admin-managed settings groups.
/// </summary>
public interface IAppSettingsService
{
    /// <summary>
    /// Gets a settings group, falling back to its defaults for a missing row or property.
    /// </summary>
    /// <typeparam name="T">The settings group type.</typeparam>
    /// <param name="key">The <see cref="SettingKey{T}"/> of the group.</param>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>The current settings.</returns>
    Task<T> GetAsync<T>(SettingKey<T> key, CancellationToken ct = default)
        where T : class, new();

    /// <summary>
    /// Saves a settings group, replacing its previous value.
    /// </summary>
    /// <typeparam name="T">The settings group type.</typeparam>
    /// <param name="key">The <see cref="SettingKey{T}"/> of the group.</param>
    /// <param name="value">The settings to save.</param>
    /// <param name="updatedBy">The ID of the user saving them, if known.</param>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SaveAsync<T>(SettingKey<T> key, T value, long? updatedBy, CancellationToken ct = default)
        where T : class, new();

    /// <summary>
    /// Deletes a settings group, so it falls back to its defaults.
    /// </summary>
    /// <typeparam name="T">The settings group type.</typeparam>
    /// <param name="key">The <see cref="SettingKey{T}"/> of the group.</param>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ResetAsync<T>(SettingKey<T> key, CancellationToken ct = default)
        where T : class, new();
}
