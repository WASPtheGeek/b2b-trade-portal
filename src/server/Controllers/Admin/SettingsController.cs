using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Services.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// Admin controller for application settings. Each settings group has a GET returning the
/// current values (defaults filled in), a PUT replacing them, and a DELETE restoring defaults.
/// </summary>
[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = RoleNames.Admin)]
public class SettingsController : ControllerBase
{
    private readonly IAppSettingsService _settings;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="SettingsController"/> class.
    /// </summary>
    /// <param name="settings">The settings service.</param>
    /// <param name="currentUser">The current user service.</param>
    public SettingsController(IAppSettingsService settings, ICurrentUserService currentUser)
    {
        _settings = Guard.Against.Null(settings, nameof(settings));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Gets the header names expected in ERP import files.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The current <see cref="ImportColumnSettings"/>.</returns>
    [HttpGet("import-columns")]
    public async Task<ActionResult<ImportColumnSettings>> GetImportColumns(CancellationToken ct) =>
        Ok(await _settings.GetAsync(SettingKeys.ImportColumns, ct));

    /// <summary>
    /// Saves the header names expected in ERP import files. Headers are trimmed and must be
    /// non-empty and unique (case-insensitive).
    /// </summary>
    /// <param name="request">The new <see cref="ImportColumnSettings"/>.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The saved <see cref="ImportColumnSettings"/>.</returns>
    [HttpPut("import-columns")]
    public async Task<ActionResult<ImportColumnSettings>> SaveImportColumns(ImportColumnSettings request, CancellationToken ct)
    {
        var columns = request.Normalize();

        await _settings.SaveAsync(SettingKeys.ImportColumns, columns, _currentUser.UserId, ct);

        return Ok(columns);
    }

    /// <summary>
    /// Restores the default ERP import header names.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The default <see cref="ImportColumnSettings"/>.</returns>
    [HttpDelete("import-columns")]
    public async Task<ActionResult<ImportColumnSettings>> ResetImportColumns(CancellationToken ct)
    {
        await _settings.ResetAsync(SettingKeys.ImportColumns, ct);

        return Ok(new ImportColumnSettings());
    }

    /// <summary>
    /// Gets the admin UI display preferences.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The current <see cref="DisplaySettings"/>.</returns>
    [HttpGet("display")]
    public async Task<ActionResult<DisplaySettings>> GetDisplay(CancellationToken ct) =>
        Ok(await _settings.GetAsync(SettingKeys.Display, ct));

    /// <summary>
    /// Saves the admin UI display preferences.
    /// </summary>
    /// <param name="request">The new <see cref="DisplaySettings"/>.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The saved <see cref="DisplaySettings"/>.</returns>
    [HttpPut("display")]
    public async Task<ActionResult<DisplaySettings>> SaveDisplay(DisplaySettings request, CancellationToken ct)
    {
        await _settings.SaveAsync(SettingKeys.Display, request, _currentUser.UserId, ct);

        return Ok(request);
    }
}
