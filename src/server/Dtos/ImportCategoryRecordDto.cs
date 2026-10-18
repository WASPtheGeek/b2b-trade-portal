namespace Elkaro.Server.Dtos;

/// <summary>
/// A category an import job created.
/// </summary>
/// <param name="RowNumber">The source file row that caused the category to be created.</param>
/// <param name="CategoryId">The created category's ID.</param>
/// <param name="Path">The category's path at import time, e.g. "Rotaļlietas › Galda spēles".</param>
/// <param name="CurrentName">The category's current name, or <c>null</c> if it has since been deleted.</param>
public record ImportCategoryRecordDto(int RowNumber, long? CategoryId, string Path, string? CurrentName);
