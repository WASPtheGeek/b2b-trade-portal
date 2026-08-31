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
    /// <param name="currentUser">The current user service.</param>
    /// <param name="env">The web host environment.</param>
    public ImportController(ElkaroDbContext db, IImportJobQueue queue, ICurrentUserService currentUser, IWebHostEnvironment env)
    {
        _db = db;
        _queue = queue;
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
            EntityType = "products",
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

        return Ok(new ImportJobStatusDto(
            batch.Id, batch.Status.ToString(),
            batch.TotalRecords,
            batch.SuccessCount + batch.FailureCount,
            batch.SuccessCount,
            0,
             batch.FailureCount,
            batch.StartedAt,
            batch.FinishedAt
        ));
    }

    /// <summary>
    /// Gets the errors associated with a specific import job by its ID, with pagination support.
    /// </summary>
    /// <param name="jobId">The ID of the import job.</param>
    /// <param name="paging">Paging parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The list of import row errors.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("{jobId:long}/errors")]
    public async Task<ActionResult<IReadOnlyList<ImportRowErrorDto>>> GetErrors(
        long jobId,
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        if (!await _db.ImportBatches.AnyAsync(b => b.Id == jobId, ct))
        {
            throw new ResourceNotFoundException($"Importēšanas darbs ar ID {jobId} nav atrasts.");
        }

        var errors = await _db.ImportLogs
            .Where(l => l.BatchId == jobId && l.Status == ImportRecordStatus.Failed)
            .OrderBy(l => l.Id)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .Select(l => new ImportRowErrorDto(
                l.RowNumber,
                l.ExternalId,
                l.ErrorMessage ?? "Nezināma kļūda."
            ))
            .ToListAsync(ct);

        return Ok(errors);
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

        return Ok(batches.
            Select(b => new ImportJobStatusDto(
                b.Id,
                b.Status.ToString(),
                b.TotalRecords,
                b.SuccessCount + b.FailureCount,
                b.SuccessCount,
                0,
                b.FailureCount,
                b.StartedAt,
                b.FinishedAt
            ))
            .ToList());
    }
}
