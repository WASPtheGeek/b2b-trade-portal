using System.Threading.Channels;

namespace Elkaro.Server.Services.Import;

public record ImportJob(long BatchId, string FilePath, string OriginalFileName);

/// <summary>
/// Interface for an in-process background queue for CSV/XLSX import jobs.
/// This queue is designed to handle import jobs without relying on external job
/// processing frameworks like Hangfire or cloud-based queues.
/// It is suitable for scenarios where jobs do not need to survive application restarts
/// or run across multiple API instances.
/// </summary>
public interface IImportJobQueue
{
    /// <summary>
    /// Enqueues an import job for processing. The job will be processed in the order it was enqueued.
    /// </summary>
    /// <param name="job">The import job to enqueue.</param>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>A <see cref="ValueTask"/> that completes when the job has been enqueued.</returns>
    ValueTask EnqueueAsync(ImportJob job, CancellationToken ct = default);

    /// <summary>
    /// Asynchronously reads all import jobs from the queue. This method returns an <see cref="IAsyncEnumerable{T}"/>
    /// that yields import jobs as they become available. The enumeration will continue until the queue is
    /// completed or the provided cancellation token is triggered.
    /// </summary>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>An <see cref="IAsyncEnumerable{ImportJob}"/> that yields import jobs as they become available.</returns>
    IAsyncEnumerable<ImportJob> ReadAllAsync(CancellationToken ct = default);
}

public class ImportJobQueue : IImportJobQueue
{
    /// <summary>
    /// The channel used to store import jobs.
    /// </summary>
    private readonly Channel<ImportJob> _channel = Channel.CreateUnbounded<ImportJob>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

    /// <inheritdoc/>
    public ValueTask EnqueueAsync(ImportJob job, CancellationToken ct = default) =>
        _channel.Writer.WriteAsync(job, ct);

    /// <inheritdoc/>
    public IAsyncEnumerable<ImportJob> ReadAllAsync(CancellationToken ct = default) =>
        _channel.Reader.ReadAllAsync(ct);
}
