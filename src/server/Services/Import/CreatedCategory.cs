namespace Elkaro.Server.Services.Import;

/// <summary>
/// A category the importer created.
/// </summary>
/// <param name="Id">The new category's ID.</param>
/// <param name="Path">The full path from the top level, e.g. "Rotaļlietas › Galda spēles".</param>
public record CreatedCategory(long Id, string Path);
