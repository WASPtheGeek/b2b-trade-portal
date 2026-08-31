using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Services.Import;

/// <summary>
/// The ImportBatchProcessor class is responsible for processing import jobs in a batch manner.
/// It handles the parsing, validation, and upserting of each row in the import file, records per-row outcomes, and finalizes the batch.
/// This class is designed to be run off the request thread (see ImportBackgroundService) to
/// avoid request timeouts when processing large supplier files.
/// </summary>
public class ImportBatchProcessor
{
    private readonly ElkaroDbContext _db;
    private readonly ImportFileParserResolver _parserResolver;
    private readonly ILogger<ImportBatchProcessor> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ImportBatchProcessor"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="parserResolver">The import file parser resolver.</param>
    /// <param name="logger">The logger instance.</param>
    public ImportBatchProcessor(ElkaroDbContext db, ImportFileParserResolver parserResolver, ILogger<ImportBatchProcessor> logger)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _parserResolver = Guard.Against.Null(parserResolver, nameof(parserResolver));
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <summary>
    /// Processes the specified import job.
    /// </summary>
    /// <param name="job">The import job to process.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ProcessAsync(ImportJob job, CancellationToken ct = default)
    {
        var batch = await _db.ImportBatches.FirstOrDefaultAsync(b => b.Id == job.BatchId, ct);

        if (batch is null)
        {
            _logger.LogError("Import batch {BatchId} not found — cannot process", job.BatchId);
            return;
        }

        batch.Status = ImportStatus.Running;
        await _db.SaveChangesAsync(ct);

        var rowImporter = new ProductRowImporter(_db);
        int total = 0, success = 0, failure = 0;

        try
        {
            var parser = _parserResolver.Resolve(job.OriginalFileName);
            await using var stream = File.OpenRead(job.FilePath);

            foreach (var row in parser.Parse(stream))
            {
                ct.ThrowIfCancellationRequested();
                total++;

                RowImportResult result;

                try
                {
                    result = await rowImporter.ImportRowAsync(row, ct);
                }
                catch (Exception ex)
                {
                    // A single malformed row must never abort the whole batch.
                    result = new RowImportResult(false, false, ex.Message);
                    _logger.LogWarning(ex, "Import batch {BatchId} row {Row} threw", batch.Id, row.RowNumber);
                }

                if (result.Success)
                {
                    success++;
                }
                else
                {
                    failure++;
                }

                _db.ImportLogs.Add(new ImportLog
                {
                    BatchId = batch.Id,
                    EntityType = "products",
                    ExternalId = row.Ean,
                    RowNumber = row.RowNumber,
                    Status = result.Success ? ImportRecordStatus.Success : ImportRecordStatus.Failed,
                    ErrorMessage = result.ErrorMessage,
                });

                // Flush progress periodically so GET .../import/{jobId} shows
                // live progress on a large file instead of jumping from 0 to done.
                if (total % 50 == 0)
                {
                    batch.TotalRecords = total;
                    batch.SuccessCount = success;
                    batch.FailureCount = failure;
                    await _db.SaveChangesAsync(ct);
                }
            }

            batch.TotalRecords = total;
            batch.SuccessCount = success;
            batch.FailureCount = failure;
            batch.Status = failure == 0 ? ImportStatus.Success : (success == 0 ? ImportStatus.Failed : ImportStatus.Partial);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Import batch {BatchId} failed outright", batch.Id);
            batch.Status = ImportStatus.Failed;
            batch.Notes = $"Import aborted: {ex.Message}";
        }
        finally
        {
            batch.FinishedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(ct);

            try { File.Delete(job.FilePath); } catch { /* best-effort cleanup */ }
        }
    }
}
