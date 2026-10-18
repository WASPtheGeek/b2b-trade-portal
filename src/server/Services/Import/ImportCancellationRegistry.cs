using System.Collections.Concurrent;

namespace Elkaro.Server.Services.Import;

/// <summary>
/// In-memory <see cref="IImportCancellationRegistry"/>. Like <see cref="ImportJobQueue"/>, it only
/// covers batches processed by this API instance.
/// </summary>
public class ImportCancellationRegistry : IImportCancellationRegistry
{
    /// <summary>
    /// The cancellation sources of batches that are queued, running or already cancelled.
    /// </summary>
    private readonly ConcurrentDictionary<long, CancellationTokenSource> _sources = new();

    /// <inheritdoc/>
    public CancellationToken GetToken(long batchId) =>
        _sources.GetOrAdd(batchId, _ => new CancellationTokenSource()).Token;

    /// <inheritdoc/>
    public void Cancel(long batchId) =>
        _sources.GetOrAdd(batchId, _ => new CancellationTokenSource()).Cancel();

    /// <inheritdoc/>
    public void Release(long batchId)
    {
        if (_sources.TryRemove(batchId, out var source))
        {
            source.Dispose();
        }
    }
}
