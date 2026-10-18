using Ardalis.GuardClauses;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using Elkaro.Server.Services.Settings;

namespace Elkaro.Server.Services.Import;

/// <summary>
/// Defines a parser for import files, allowing different implementations for various file formats (e.g., CSV, XLSX).
/// </summary>
public interface IImportFileParser
{
    /// <summary>
    /// Determines whether the parser can handle the specified file extension.
    /// </summary>
    /// <param name="fileExtension">The file extension to check, including the leading dot (e.g., ".csv").</param>
    /// <returns>True if the parser can handle the specified file extension; otherwise, false.</returns>
    bool CanParse(string fileExtension);

    /// <summary>
    /// Parses the provided stream and yields <see cref="RawImportRow"/> instances representing each row in the import file.
    /// </summary>
    /// <param name="stream">The stream containing the import file data.</param>
    /// <param name="columns">The header names to read each field from (admin-configurable).</param>
    /// <returns>An enumerable of <see cref="RawImportRow"/> instances.</returns>
    IEnumerable<RawImportRow> Parse(Stream stream, ImportColumnSettings columns);
}

/// <summary>
/// Resolves the appropriate <see cref="IImportFileParser"/> implementation based on the file extension of the import file.
/// Picks the right parser by file extension and hides CsvHelper vs. ClosedXML from callers.
/// </summary>
public class ImportFileParserResolver
{
    private readonly IEnumerable<IImportFileParser> _parsers;

    public ImportFileParserResolver(IEnumerable<IImportFileParser> parsers)
        => _parsers = Guard.Against.Null(parsers, nameof(parsers));

    /// <summary>
    /// Resolves the appropriate <see cref="IImportFileParser"/> implementation for the specified file name based on its extension.
    /// </summary>
    /// <param name="fileName">The name of the import file, including its extension.</param>
    /// <returns>The appropriate <see cref="IImportFileParser"/> implementation for the specified file.</returns>
    /// <exception cref="NotSupportedException">Thrown if no parser is registered for the file's extension.</exception>
    public IImportFileParser Resolve(string fileName)
    {
        var ext = Path.GetExtension(fileName);

        return _parsers.FirstOrDefault(p => p.CanParse(ext))
            ?? throw new NotSupportedException($"Neviena import parser nav reģistrēta faila paplašinājumam '{ext}'. Atbalstītie: .csv, .xlsx");
    }
}

/// <summary>
/// Parser for CSV product import files.
/// Header names come from the admin-configurable <see cref="ImportColumnSettings"/> (matched
/// case-insensitively); the defaults are the client's ERP export headers.
/// </summary>
public class CsvProductImportFileParser : IImportFileParser
{
    /// <inheritdoc/>
    public bool CanParse(string fileExtension) =>
        string.Equals(fileExtension, ".csv", StringComparison.OrdinalIgnoreCase);

    /// <inheritdoc/>
    public IEnumerable<RawImportRow> Parse(Stream stream, ImportColumnSettings columns)
    {
        using var reader = new StreamReader(stream);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null,
            TrimOptions = TrimOptions.Trim,
            // Applied to both the file's headers and the names passed to GetField, so matching is
            // case- and whitespace-insensitive.
            PrepareHeaderForMatch = args => args.Header.Trim().ToLowerInvariant(),
        };
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        if (csv.GetFieldIndex(columns.Ean, isTryGet: true) < 0)
        {
            throw new InvalidOperationException($"The file has no \"{columns.Ean}\" column (the configured EAN header).");
        }

        var rowNumber = 1; // header is row 0 in the file; data starts at 1

        while (csv.Read())
        {
            rowNumber++;
            yield return new RawImportRow
            {
                // Field names are case-insensitive because of PrepareHeaderForMatch above.
                RowNumber = rowNumber,
                Ean = csv.GetField(columns.Ean),
                Name = csv.GetField(columns.Name),
                Brand = csv.GetField(columns.Brand),
                PriceRaw = csv.GetField(columns.Price),
                SoldByPieceRaw = csv.GetField(columns.SoldByPiece),
                PiecesPerPackageRaw = csv.GetField(columns.PiecesPerPackage),
                PiecesPerBoxRaw = csv.GetField(columns.PiecesPerBox),
                Description = csv.GetField(columns.Description),
                Catalog = csv.GetField(columns.Catalog),
                Group = csv.GetField(columns.Group),
                Subgroup = csv.GetField(columns.Subgroup),
            };
        }
    }
}

/// <summary>
/// Parser for XLSX product import files.
/// Header names come from the admin-configurable <see cref="ImportColumnSettings"/> (matched
/// case-insensitively); the defaults are the client's ERP export headers.
/// The header row doesn't have to be the first one - ERP exports may start with blank or title
/// rows - so the first row containing an "EAN" cell is used.
/// </summary>
public class XlsxProductImportFileParser : IImportFileParser
{
    /// <summary>
    /// How many leading rows are searched for the header row.
    /// </summary>
    private const int HeaderSearchRowLimit = 20;

    /// <inheritdoc/>
    public bool CanParse(string fileExtension) =>
        string.Equals(fileExtension, ".xlsx", StringComparison.OrdinalIgnoreCase);

    /// <inheritdoc/>
    public IEnumerable<RawImportRow> Parse(Stream stream, ImportColumnSettings columns)
    {
        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.First();
        var lastRow = sheet.LastRowUsed()?.RowNumber() ?? 1;
        var headerRow = FindHeaderRow(sheet, lastRow, columns.Ean);
        var columnByHeader = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var cell in headerRow.CellsUsed())
        {
            var header = cell.GetString().Trim();

            if (!string.IsNullOrEmpty(header))
            {
                columnByHeader[header] = cell.Address.ColumnNumber;
            }
        }

        string? Get(IXLRow row, string header) =>
            columnByHeader.TryGetValue(header.Trim(), out var col) ? row.Cell(col).GetString() : null;

        for (var r = headerRow.RowNumber() + 1; r <= lastRow; r++)
        {
            var row = sheet.Row(r);

            if (row.IsEmpty())
            {
                continue; // skip empty rows
            }

            yield return new RawImportRow
            {
                // XLSX is already case-insensitive because columnByHeader uses StringComparer.OrdinalIgnoreCase.
                RowNumber = r,
                Ean = Get(row, columns.Ean),
                Name = Get(row, columns.Name),
                Brand = Get(row, columns.Brand),
                PriceRaw = Get(row, columns.Price),
                SoldByPieceRaw = Get(row, columns.SoldByPiece),
                PiecesPerPackageRaw = Get(row, columns.PiecesPerPackage),
                PiecesPerBoxRaw = Get(row, columns.PiecesPerBox),
                Description = Get(row, columns.Description),
                Catalog = Get(row, columns.Catalog),
                Group = Get(row, columns.Group),
                Subgroup = Get(row, columns.Subgroup),
            };
        }
    }

    /// <summary>
    /// Finds the header row: the first of the leading rows that has a cell reading the EAN header.
    /// </summary>
    /// <param name="sheet">The <see cref="IXLWorksheet"/> being imported.</param>
    /// <param name="lastRow">The number of the sheet's last used row.</param>
    /// <param name="eanHeader">The configured EAN header (<see cref="ImportColumnSettings.Ean"/>).</param>
    /// <returns>The header <see cref="IXLRow"/>.</returns>
    /// <exception cref="InvalidOperationException">No header row with an EAN column was found.</exception>
    private static IXLRow FindHeaderRow(IXLWorksheet sheet, int lastRow, string eanHeader)
    {
        var searchUntil = Math.Min(lastRow, HeaderSearchRowLimit);

        for (var r = 1; r <= searchUntil; r++)
        {
            var row = sheet.Row(r);
            var hasEan = row.CellsUsed()
                .Any(c => string.Equals(c.GetString().Trim(), eanHeader, StringComparison.OrdinalIgnoreCase));

            if (hasEan)
            {
                return row;
            }
        }

        throw new InvalidOperationException(
            $"No header row with an \"{eanHeader}\" column (the configured EAN header) found in the first {HeaderSearchRowLimit} rows.");
    }
}
