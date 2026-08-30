using Ardalis.GuardClauses;

namespace Elkaro.Server.Services.Import;

/// <summary>
/// Single background worker draining the import queue. ElkaroDbContext is
/// scoped, so each job gets its own scope/DbContext instance rather than
/// sharing the singleton-lifetime queue's scope.
/// </summary>
public class ImportBackgroundService : BackgroundService
{
    private readonly IImportJobQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ImportBackgroundService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ImportBackgroundService"/> class.
    /// </summary>
    /// <param name="queue">The import job queue.</param>
    /// <param name="scopeFactory">The service scope factory.</param>
    /// <param name="logger">The logger instance.</param>
    public ImportBackgroundService(
        IImportJobQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<ImportBackgroundService> logger)
    {
        _queue = Guard.Against.Null(queue, nameof(queue));
        _scopeFactory = Guard.Against.Null(scopeFactory, nameof(scopeFactory));
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var job in _queue.ReadAllAsync(stoppingToken))
        {
            using var scope = _scopeFactory.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<ImportBatchProcessor>();

            try
            {
                await processor.ProcessAsync(job, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error processing import batch {BatchId}", job.BatchId);
            }
        }
    }
}
