using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Elkaro.Server.Services.Settings;
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
    private readonly IAppSettingsService _settings;
    private readonly ILogger<ImportBatchProcessor> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ImportBatchProcessor"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="parserResolver">The import file parser resolver.</param>
    /// <param name="settings">The settings service, for the configured import column headers.</param>
    /// <param name="logger">The logger instance.</param>
    public ImportBatchProcessor(
        ElkaroDbContext db,
        ImportFileParserResolver parserResolver,
        IAppSettingsService settings,
        ILogger<ImportBatchProcessor> logger)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _parserResolver = Guard.Against.Null(parserResolver, nameof(parserResolver));
        _settings = Guard.Against.Null(settings, nameof(settings));
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <summary>
    /// Processes the specified import job.
    /// </summary>
    /// <param name="job">The import job to process.</param>
    /// <param name="ct">The cancellation token, cancelled on shutdown or when an admin stops the batch.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ProcessAsync(ImportJob job, CancellationToken ct = default)
    {
        // Not cancellable: a batch cancelled while still queued must still be loaded, so it can be
        // marked as finished instead of staying Pending forever.
        var batch = await _db.ImportBatches.FirstOrDefaultAsync(b => b.Id == job.BatchId, CancellationToken.None);

        if (batch is null)
        {
            _logger.LogError("Import batch {BatchId} not found — cannot process", job.BatchId);
            return;
        }

        var rowImporter = new ProductRowImporter(_db);
        int total = 0, success = 0, failure = 0;

        try
        {
            ct.ThrowIfCancellationRequested();
            batch.Status = ImportStatus.Running;
            await _db.SaveChangesAsync(ct);

            var parser = _parserResolver.Resolve(job.OriginalFileName);
            var columns = await _settings.GetAsync(SettingKeys.ImportColumns, ct);
            await using var stream = File.OpenRead(job.FilePath);

            foreach (var row in parser.Parse(stream, columns))
            {
                ct.ThrowIfCancellationRequested();
                total++;

                RowImportResult result;

                try
                {
                    result = await rowImporter.ImportRowAsync(row, ct);
                }
                catch (Exception ex) when (!ct.IsCancellationRequested)
                {
                    // A single malformed row must never abort the whole batch.
                    result = new RowImportResult(false, false, ex.Message);
                    _logger.LogWarning(ex, "Import batch {BatchId} row {Row} threw", batch.Id, row.RowNumber);
                    DiscardFailedRowChanges();
                }

                if (result.Success)
                {
                    success++;
                }
                else
                {
                    failure++;
                }

                // Categories the row created are logged even if the row then failed: they were
                // saved, and the admin should know they now exist.
                foreach (var category in rowImporter.TakeCreatedCategories())
                {
                    _db.ImportLogs.Add(new ImportLog
                    {
                        BatchId = batch.Id,
                        EntityType = ImportEntityTypes.Categories,
                        InternalRecordId = category.Id,
                        PayloadJson = new ImportLogPayload(row.RowNumber, ImportLogPayload.CreatedAction, category.Path).ToJson(),
                        Status = ImportRecordStatus.Success,
                    });
                }

                _db.ImportLogs.Add(new ImportLog
                {
                    BatchId = batch.Id,
                    EntityType = ImportEntityTypes.Products,
                    ExternalId = row.Ean,
                    InternalRecordId = result.ProductId,
                    PayloadJson = new ImportLogPayload(row.RowNumber, ImportLogPayload.ActionFor(result)).ToJson(),
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

            batch.Status = failure == 0 ? ImportStatus.Success : (success == 0 ? ImportStatus.Failed : ImportStatus.Partial);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // Rows imported before the stop stay imported; only the interrupted row is dropped.
            // There's no Cancelled status in the schema, so it's recorded as Failed with a note.
            _logger.LogInformation("Import batch {BatchId} cancelled after {Rows} rows", batch.Id, total);
            DiscardFailedRowChanges();
            batch.Status = ImportStatus.Failed;
            batch.Notes = $"Import cancelled after {total} rows.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Import batch {BatchId} failed outright", batch.Id);
            batch.Status = ImportStatus.Failed;
            batch.Notes = $"Import aborted: {ex.Message}";
        }
        finally
        {
            batch.TotalRecords = total;
            batch.SuccessCount = success;
            batch.FailureCount = failure;
            batch.FinishedAt = DateTimeOffset.UtcNow;
            await SaveFinalStatusAsync(batch);

            try { File.Delete(job.FilePath); } catch { /* best-effort cleanup */ }
        }
    }

    /// <summary>
    /// Detaches the entities a failed row left pending in the change tracker. Otherwise every
    /// later <see cref="DbContext.SaveChangesAsync(CancellationToken)"/> would retry them and fail
    /// too, turning one bad row into a failure of the whole rest of the batch.
    /// </summary>
    private void DiscardFailedRowChanges()
    {
        var pending = _db.ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Where(e => e.Entity is not ImportBatch and not ImportLog)
            .ToList();

        foreach (var entry in pending)
        {
            entry.State = EntityState.Detached;
        }
    }

    /// <summary>
    /// Persists the batch's final status. If the regular save fails (e.g. a pending
    /// <see cref="ImportLog"/> can't be written), the pending changes are dropped and the batch row
    /// is marked <see cref="ImportStatus.Failed"/> directly, so it never stays Running forever.
    /// Uses <see cref="CancellationToken.None"/> so a shutdown mid-import still records the outcome.
    /// </summary>
    /// <param name="batch">The tracked <see cref="ImportBatch"/> being finalized.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    private async Task SaveFinalStatusAsync(ImportBatch batch)
    {
        try
        {
            await _db.SaveChangesAsync(CancellationToken.None);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Import batch {BatchId} final save failed — marking it as failed", batch.Id);
            _db.ChangeTracker.Clear();

            var notes = $"Import aborted: could not save results ({ex.GetBaseException().Message})";

            await _db.ImportBatches
                .Where(b => b.Id == batch.Id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(b => b.Status, ImportStatus.Failed)
                    .SetProperty(b => b.FinishedAt, batch.FinishedAt)
                    .SetProperty(b => b.Notes, notes),
                    CancellationToken.None);
        }
    }
}
