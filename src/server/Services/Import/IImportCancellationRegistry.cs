namespace Elkaro.Server.Services.Import;

/// <summary>
/// Tracks a cancellation source per import batch, so an admin request can stop a batch that is
/// running on the background worker - or one still waiting in the queue.
/// </summary>
public interface IImportCancellationRegistry
{
    /// <summary>
    /// Gets the cancellation token for the specified batch, creating its source if needed. A batch
    /// cancelled while still queued gets an already-cancelled token here.
    /// </summary>
    /// <param name="batchId">The ID of the import batch.</param>
    /// <returns>The <see cref="CancellationToken"/> that is cancelled when an admin stops the batch.</returns>
    CancellationToken GetToken(long batchId);

    /// <summary>
    /// Requests cancellation of the specified batch.
    /// </summary>
    /// <param name="batchId">The ID of the import batch.</param>
    void Cancel(long batchId);

    /// <summary>
    /// Releases the cancellation source of a batch that has finished processing.
    /// </summary>
    /// <param name="batchId">The ID of the import batch.</param>
    void Release(long batchId);
}
