namespace Elkaro.Server.Dtos;

/// <summary>
/// A single row of an import job and what happened to it.
/// </summary>
/// <param name="RowNumber">The row number in the source file.</param>
/// <param name="Ean">The EAN of the row, if it had one.</param>
/// <param name="Outcome">The <see cref="ImportRecordOutcome"/> name: Created, Updated or Failed.</param>
/// <param name="ProductId">The ID of the created/updated product, if the row succeeded.</param>
/// <param name="ProductName">The product's current name, if it still exists.</param>
/// <param name="ErrorMessage">Why the row failed, if it did.</param>
public record ImportRecordDto(
    int RowNumber,
    string? Ean,
    string Outcome,
    long? ProductId,
    string? ProductName,
    string? ErrorMessage);
