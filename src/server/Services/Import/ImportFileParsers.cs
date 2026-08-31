using Ardalis.GuardClauses;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

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
    /// <returns>An enumerable of <see cref="RawImportRow"/> instances.</returns>
    IEnumerable<RawImportRow> Parse(Stream stream);
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
/// Expected header row (case-insensitive, exact spelling per the client's export):
/// EAN, Nosaukums, Zīmols, Cena, gb, iep, kaste, Apraksts, Katalogs, Grupa, apakšgrupa.
/// </summary>
public class CsvProductImportFileParser : IImportFileParser
{
    /// <inheritdoc/>
    public bool CanParse(string fileExtension) =>
        string.Equals(fileExtension, ".csv", StringComparison.OrdinalIgnoreCase);

    /// <inheritdoc/>
    public IEnumerable<RawImportRow> Parse(Stream stream)
    {
        using var reader = new StreamReader(stream);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null,
            TrimOptions = TrimOptions.Trim,
            PrepareHeaderForMatch = args => args.Header.ToLowerInvariant(),
        };
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        var rowNumber = 1; // header is row 0 in the file; data starts at 1

        while (csv.Read())
        {
            rowNumber++;
            yield return new RawImportRow
            {
                // Field names are case-insensitive because of PrepareHeaderForMatch above.
                RowNumber = rowNumber,
                Ean = csv.GetField("EAN"),
                Name = csv.GetField("Nosaukums"),
                Brand = csv.GetField("Zīmols"),
                PriceRaw = csv.GetField("Cena"),
                SoldByPieceRaw = csv.GetField("gb"),
                PiecesPerPackageRaw = csv.GetField("iep."),
                PiecesPerBoxRaw = csv.GetField("kaste"),
                Description = csv.GetField("Apraksts"),
                Catalog = csv.GetField("Katalogs"),
                Group = csv.GetField("Grupa"),
                Subgroup = csv.GetField("apakšgrupa"),
            };
        }
    }
}

/// <summary>
/// Parser for XLSX product import files.
/// Expected header row (case-insensitive, exact spelling per the client's export):
/// EAN, Nosaukums, Zīmols, Cena, gb, iep, kaste, Apraksts, Katalogs, Grupa, apakšgrupa.
/// </summary>
public class XlsxProductImportFileParser : IImportFileParser
{
    /// <inheritdoc/>
    public bool CanParse(string fileExtension) =>
        string.Equals(fileExtension, ".xlsx", StringComparison.OrdinalIgnoreCase);

    /// <inheritdoc/>
    public IEnumerable<RawImportRow> Parse(Stream stream)
    {
        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.First();
        var headerRow = sheet.Row(1);
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
            columnByHeader.TryGetValue(header, out var col) ? row.Cell(col).GetString() : null;

        var lastRow = sheet.LastRowUsed()?.RowNumber() ?? 1;

        for (var r = 2; r <= lastRow; r++)
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
                Ean = Get(row, "EAN"),
                Name = Get(row, "Nosaukums"),
                Brand = Get(row, "Zīmols"),
                PriceRaw = Get(row, "Cena"),
                SoldByPieceRaw = Get(row, "gb"),
                PiecesPerPackageRaw = Get(row, "iep."),
                PiecesPerBoxRaw = Get(row, "kaste"),
                Description = Get(row, "Apraksts"),
                Catalog = Get(row, "Katalogs"),
                Group = Get(row, "Grupa"),
                Subgroup = Get(row, "apakšgrupa"),
            };
        }
    }
}
