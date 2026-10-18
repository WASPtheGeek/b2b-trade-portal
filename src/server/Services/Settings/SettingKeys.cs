namespace Elkaro.Server.Services.Settings;

/// <summary>
/// The settings groups an admin can manage.
/// </summary>
public static class SettingKeys
{
    /// <summary>
    /// The header names expected in ERP import files.
    /// </summary>
    public static readonly SettingKey<ImportColumnSettings> ImportColumns = new("import.columns");

    /// <summary>
    /// Admin UI display preferences.
    /// </summary>
    public static readonly SettingKey<DisplaySettings> Display = new("admin.display");
}
