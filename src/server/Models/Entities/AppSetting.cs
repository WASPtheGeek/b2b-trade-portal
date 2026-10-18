namespace Elkaro.Server.Models.Entities;

/// <summary>
/// One admin-managed settings group, stored as a JSON document under its key.
/// </summary>
public class AppSetting
{
    /// <summary>
    /// Gets or sets the settings group key, e.g. "import.columns".
    /// </summary>
    public string Key { get; set; } = null!;

    /// <summary>
    /// Gets or sets the settings group's JSON document.
    /// </summary>
    public string ValueJson { get; set; } = null!;

    /// <summary>
    /// Gets or sets when the settings were last saved.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who last saved the settings, if known.
    /// </summary>
    public long? UpdatedBy { get; set; }
}
