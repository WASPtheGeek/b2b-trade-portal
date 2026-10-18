using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Services.Import;

/// <summary>
/// Single background worker draining the import queue. ElkaroDbContext is
/// scoped, so each job gets its own scope/DbContext instance rather than
/// sharing the singleton-lifetime queue's scope.
/// </summary>
public class ImportBackgroundService : BackgroundService
{
    private readonly IImportJobQueue _queue;
    private readonly IImportCancellationRegistry _cancellations;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ImportBackgroundService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ImportBackgroundService"/> class.
    /// </summary>
    /// <param name="queue">The import job queue.</param>
    /// <param name="cancellations">The per-batch cancellation registry.</param>
    /// <param name="scopeFactory">The service scope factory.</param>
    /// <param name="logger">The logger instance.</param>
    public ImportBackgroundService(
        IImportJobQueue queue,
        IImportCancellationRegistry cancellations,
        IServiceScopeFactory scopeFactory,
        ILogger<ImportBackgroundService> logger)
    {
        _queue = Guard.Against.Null(queue, nameof(queue));
        _cancellations = Guard.Against.Null(cancellations, nameof(cancellations));
        _scopeFactory = Guard.Against.Null(scopeFactory, nameof(scopeFactory));
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await FailOrphanedBatchesAsync(stoppingToken);

        await foreach (var job in _queue.ReadAllAsync(stoppingToken))
        {
            using var scope = _scopeFactory.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<ImportBatchProcessor>();
            using var jobCts = CancellationTokenSource.CreateLinkedTokenSource(
                stoppingToken,
                _cancellations.GetToken(job.BatchId));

            try
            {
                await processor.ProcessAsync(job, jobCts.Token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error processing import batch {BatchId}", job.BatchId);
            }
            finally
            {
                _cancellations.Release(job.BatchId);
            }
        }
    }

    /// <summary>
    /// The queue lives in memory, so a batch still Pending/Running at startup was lost with the
    /// previous process and will never be picked up. Marks such batches as
    /// <see cref="ImportStatus.Failed"/> so clients polling them stop waiting.
    /// </summary>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    private async Task FailOrphanedBatchesAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ElkaroDbContext>();
        var now = DateTimeOffset.UtcNow;

        var count = await db.ImportBatches
            .Where(b => b.Status == ImportStatus.Pending || b.Status == ImportStatus.Running)
            .ExecuteUpdateAsync(s => s
                .SetProperty(b => b.Status, ImportStatus.Failed)
                .SetProperty(b => b.FinishedAt, now)
                .SetProperty(b => b.Notes, "Import aborted: the server restarted before it finished."),
                ct);

        if (count > 0)
        {
            _logger.LogWarning("Marked {Count} orphaned import batch(es) as failed", count);
        }
    }
}
