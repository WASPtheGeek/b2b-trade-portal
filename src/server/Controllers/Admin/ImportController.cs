using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Elkaro.Server.Services.Import;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// Admin controller for handling product import operations.
/// </summary>
[ApiController]
[Route("api/admin/products/import")]
[Authorize(Roles = RoleNames.Admin)]
public class ImportController : ControllerBase
{
    /// <summary>
    /// Allowed file extensions for import.
    /// </summary>
    private static readonly string[] AllowedExtensions = { ".csv", ".xlsx" };
    private readonly ElkaroDbContext _db;
    private readonly IImportJobQueue _queue;
    private readonly IImportCancellationRegistry _cancellations;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// The WebHostEnvironment instance for accessing environment-specific information.
    /// </summary>
    private readonly IWebHostEnvironment _env;

    /// <summary>
    /// Initializes a new instance of the <see cref="ImportController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="queue">The import job queue.</param>
    /// <param name="cancellations">The per-batch cancellation registry.</param>
    /// <param name="currentUser">The current user service.</param>
    /// <param name="env">The web host environment.</param>
    public ImportController(
        ElkaroDbContext db,
        IImportJobQueue queue,
        IImportCancellationRegistry cancellations,
        ICurrentUserService currentUser,
        IWebHostEnvironment env)
    {
        _db = db;
        _queue = queue;
        _cancellations = cancellations;
        _currentUser = currentUser;
        _env = env;
    }

    /// <summary>
    /// Uploads a product import file and enqueues an import job for processing.
    /// Returns 202 immediately and processes off-thread to avoid timeouts.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(200_000_000)] // 200 MB — supplier price lists can be large; tune per deployment
    public async Task<ActionResult<ImportJobAcceptedDto>> Upload(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
        {
            throw new BadRequestException("Augšupielādētajam failam nav satura.", "Tukšs fails");
        }

        var ext = Path.GetExtension(file.FileName);

        if (!AllowedExtensions.Contains(ext, StringComparer.OrdinalIgnoreCase))
        {
            throw new BadRequestException(
                $"'{ext}' netiek atbalstīts. Augšupielādējiet .csv vai .xlsx failu.",
                "Neatbalstīts faila tips");
        }

        // Add import batch to log for tracking and auditing purposes
        var batch = new ImportBatch
        {
            SourceSystem = "admin_upload",
            EntityType = ImportEntityTypes.Products,
            Status = ImportStatus.Pending,
            TriggeredBy = _currentUser.UserId,
        };

        _db.ImportBatches.Add(batch);
        await _db.SaveChangesAsync(ct);

        var storageDir = Path.Combine(_env.ContentRootPath, "App_Data", "imports");
        Directory.CreateDirectory(storageDir);
        var storedPath = Path.Combine(storageDir, $"{batch.BatchUuid}{ext}");

        await using (var target = System.IO.File.Create(storedPath))
        {
            await file.CopyToAsync(target, ct);
        }

        await _queue.EnqueueAsync(new ImportJob(batch.Id, storedPath, file.FileName), ct);

        return Accepted(new ImportJobAcceptedDto(batch.Id));
    }

    /// <summary>
    /// Gets the status of a specific import job by its ID.
    /// </summary>
    /// <param name="jobId">The ID of the import job.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The status of the import job.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("{jobId:long}")]
    public async Task<ActionResult<ImportJobStatusDto>> GetStatus(long jobId, CancellationToken ct)
    {
        var batch = await _db.ImportBatches.FirstOrDefaultAsync(b => b.Id == jobId, ct);

        if (batch is null)
        {
            throw new ResourceNotFoundException($"Importēšanas darbs ar ID {jobId} nav atrasts.");
        }

        var createdCounts = await CountCreatedAsync([batch.Id], ct);

        return Ok(ToStatusDto(batch, createdCounts));
    }

    /// <summary>
    /// Requests that a queued or running import job stop. Returns 204 immediately; the worker
    /// stops before its next row, and the job then reports <see cref="ImportStatus.Failed"/>
    /// with a note. Rows already imported are kept.
    /// </summary>
    /// <param name="jobId">The ID of the import job.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>An empty 204 No Content response.</returns>
    /// <exception cref="ResourceNotFoundException">No import job has the given ID.</exception>
    /// <exception cref="ConflictException">The import job has already finished.</exception>
    [HttpPost("{jobId:long}/cancel")]
    public async Task<IActionResult> Cancel(long jobId, CancellationToken ct)
    {
        var status = await _db.ImportBatches
            .Where(b => b.Id == jobId)
            .Select(b => (ImportStatus?)b.Status)
            .FirstOrDefaultAsync(ct);

        if (status is null)
        {
            throw new ResourceNotFoundException($"Importēšanas darbs ar ID {jobId} nav atrasts.");
        }

        if (status is not (ImportStatus.Pending or ImportStatus.Running))
        {
            throw new ConflictException("Importēšanas darbs jau ir pabeigts.", "Darbs pabeigts");
        }

        _cancellations.Cancel(jobId);

        return NoContent();
    }

    /// <summary>
    /// Gets the rows of a specific import job and what happened to each, optionally filtered by
    /// outcome, with pagination support. The total count is returned in the X-Total-Count header.
    /// </summary>
    /// <param name="jobId">The ID of the import job.</param>
    /// <param name="outcome">Optional <see cref="ImportRecordOutcome"/> to filter by.</param>
    /// <param name="paging">Paging parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The page of <see cref="ImportRecordDto"/> rows, in source file order.</returns>
    /// <exception cref="ResourceNotFoundException">No import job has the given ID.</exception>
    [HttpGet("{jobId:long}/records")]
    public async Task<ActionResult<IReadOnlyList<ImportRecordDto>>> GetRecords(
        long jobId,
        [FromQuery] ImportRecordOutcome? outcome,
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        if (!await _db.ImportBatches.AnyAsync(b => b.Id == jobId, ct))
        {
            throw new ResourceNotFoundException($"Importēšanas darbs ar ID {jobId} nav atrasts.");
        }

        var query = _db.ImportLogs.Where(l => l.BatchId == jobId && l.EntityType == ImportEntityTypes.Products);

        query = outcome switch
        {
            ImportRecordOutcome.Failed => query.Where(l => l.Status == ImportRecordStatus.Failed),
            ImportRecordOutcome.Created => query.Where(l => l.Status == ImportRecordStatus.Success
                && EF.Functions.JsonContains(l.PayloadJson!, ImportLogPayload.CreatedActionJson)),
            ImportRecordOutcome.Updated => query.Where(l => l.Status == ImportRecordStatus.Success
                && (l.PayloadJson == null || !EF.Functions.JsonContains(l.PayloadJson, ImportLogPayload.CreatedActionJson))),
            _ => query,
        };

        var total = await query.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var logs = await query
            .OrderBy(l => l.Id)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .Select(l => new
            {
                l.PayloadJson,
                l.ExternalId,
                l.Status,
                l.InternalRecordId,
                l.ErrorMessage,
                IsCreated = l.PayloadJson != null && EF.Functions.JsonContains(l.PayloadJson, ImportLogPayload.CreatedActionJson),
                ProductName = _db.Products.Where(p => p.Id == l.InternalRecordId).Select(p => p.Name).FirstOrDefault(),
            })
            .ToListAsync(ct);

        // The row number lives in the JSON payload, so it's read in memory after the query.
        var records = logs
            .Select(l => new ImportRecordDto(
                ImportLogPayload.ReadRowNumber(l.PayloadJson),
                l.ExternalId,
                (l.Status == ImportRecordStatus.Failed
                    ? ImportRecordOutcome.Failed
                    : l.IsCreated ? ImportRecordOutcome.Created : ImportRecordOutcome.Updated).ToString(),
                l.InternalRecordId,
                l.ProductName,
                l.Status == ImportRecordStatus.Failed ? l.ErrorMessage ?? "Nezināma kļūda." : null
            ))
            .ToList();

        return Ok(records);
    }

    /// <summary>
    /// Gets the categories a specific import job created, in creation order (parents before
    /// their children), with pagination support. The total count is returned in the
    /// X-Total-Count header.
    /// </summary>
    /// <param name="jobId">The ID of the import job.</param>
    /// <param name="paging">Paging parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The page of <see cref="ImportCategoryRecordDto"/> rows.</returns>
    /// <exception cref="ResourceNotFoundException">No import job has the given ID.</exception>
    [HttpGet("{jobId:long}/categories")]
    public async Task<ActionResult<IReadOnlyList<ImportCategoryRecordDto>>> GetCreatedCategories(
        long jobId,
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        if (!await _db.ImportBatches.AnyAsync(b => b.Id == jobId, ct))
        {
            throw new ResourceNotFoundException($"Importēšanas darbs ar ID {jobId} nav atrasts.");
        }

        var query = _db.ImportLogs.Where(l => l.BatchId == jobId && l.EntityType == ImportEntityTypes.Categories);

        var total = await query.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var logs = await query
            .OrderBy(l => l.Id)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .Select(l => new
            {
                l.PayloadJson,
                l.InternalRecordId,
                CurrentName = _db.Categories.Where(c => c.Id == l.InternalRecordId).Select(c => c.Name).FirstOrDefault(),
            })
            .ToListAsync(ct);

        // Row number and path live in the JSON payload, so they're read in memory after the query.
        var categories = logs
            .Select(l =>
            {
                var payload = ImportLogPayload.TryRead(l.PayloadJson);

                return new ImportCategoryRecordDto(
                    payload?.RowNumber ?? 0,
                    l.InternalRecordId,
                    payload?.Path ?? l.CurrentName ?? "—",
                    l.CurrentName);
            })
            .ToList();

        return Ok(categories);
    }

    /// <summary>
    /// Gets the history of import jobs with pagination support.
    /// </summary>
    /// <param name="paging">Paging parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The list of import job statuses.</returns>
    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<ImportJobStatusDto>>> History(
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        var total = await _db.ImportBatches.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var batches = await _db.ImportBatches
            .OrderByDescending(b => b.StartedAt)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(ct);

        var createdCounts = await CountCreatedAsync(batches.Select(b => b.Id).ToList(), ct);

        return Ok(batches.Select(b => ToStatusDto(b, createdCounts)).ToList());
    }

    /// <summary>
    /// Counts the created products and created categories, per import batch.
    /// </summary>
    /// <param name="batchIds">The IDs of the import batches.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The counts by batch ID and entity type (<see cref="ImportEntityTypes"/>); zero counts are left out.</returns>
    private async Task<Dictionary<(long BatchId, string EntityType), int>> CountCreatedAsync(
        IReadOnlyCollection<long> batchIds,
        CancellationToken ct)
    {
        var counts = await _db.ImportLogs
            .Where(l => batchIds.Contains(l.BatchId)
                && l.Status == ImportRecordStatus.Success
                && EF.Functions.JsonContains(l.PayloadJson!, ImportLogPayload.CreatedActionJson))
            .GroupBy(l => new { l.BatchId, l.EntityType })
            .Select(g => new { g.Key.BatchId, g.Key.EntityType, Count = g.Count() })
            .ToListAsync(ct);

        return counts.ToDictionary(x => (x.BatchId, x.EntityType), x => x.Count);
    }

    /// <summary>
    /// Maps an import batch to its status DTO. Successful product rows that didn't create a
    /// product updated an existing one.
    /// </summary>
    /// <param name="batch">The <see cref="ImportBatch"/> to map.</param>
    /// <param name="createdCounts">The counts from <see cref="CountCreatedAsync"/>.</param>
    /// <returns>The <see cref="ImportJobStatusDto"/> for the batch.</returns>
    private static ImportJobStatusDto ToStatusDto(
        ImportBatch batch,
        IReadOnlyDictionary<(long BatchId, string EntityType), int> createdCounts)
    {
        var createdProducts = createdCounts.GetValueOrDefault((batch.Id, ImportEntityTypes.Products));
        var createdCategories = createdCounts.GetValueOrDefault((batch.Id, ImportEntityTypes.Categories));

        return new ImportJobStatusDto(
            batch.Id,
            batch.Status.ToString(),
            batch.TotalRecords,
            batch.SuccessCount + batch.FailureCount,
            createdProducts,
            batch.SuccessCount - createdProducts,
            batch.FailureCount,
            createdCategories,
            batch.StartedAt,
            batch.FinishedAt);
    }
}
