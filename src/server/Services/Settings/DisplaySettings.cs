namespace Elkaro.Server.Services.Settings;

/// <summary>
/// Admin UI display preferences, shared by every admin.
/// </summary>
public class DisplaySettings
{
    /// <summary>
    /// Gets or sets a value indicating whether admin tables pin their actions column to the right
    /// edge by default (each admin can still toggle it per page).
    /// </summary>
    public bool StickyActionsColumn { get; set; } = true;
}
