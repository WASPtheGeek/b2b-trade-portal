using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// Admin-only controller for managing orders.
/// </summary>
[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = RoleNames.Admin)]
public class OrdersController : ControllerBase
{
    /// <summary>
    /// Statuses that are considered "terminal" and cannot be changed once reached.
    /// </summary>
    private static readonly HashSet<OrderStatus> TerminalStatuses = new() { OrderStatus.Cancelled, OrderStatus.Refunded };

    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="OrdersController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="currentUser">The current user service.</param>
    public OrdersController(ElkaroDbContext db, ICurrentUserService currentUser)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
    }

    /// <summary>
    /// Lists orders with optional filtering by status and pagination.
    /// </summary>
    /// <param name="status">The status to filter orders by.</param>
    /// <param name="paging">Paging parameters.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The list of order summaries.</returns>
    /// <exception cref="BadRequestException"></exception>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> List(
        [FromQuery] string? status,
        [FromQuery] PagingQuery paging,
        CancellationToken ct)
    {
        var query = _db.Orders.Include(o => o.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsed))
            {
                throw new BadRequestException($"'{status}' nav derīgs pasūtījuma statuss.", "Nederīgs statuss");
            }

            query = query.Where(o => o.Status == parsed);
        }

        var total = await query.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var orders = await query
            .OrderByDescending(o => o.PlacedAt)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(ct);

        return Ok(orders.Select(Controllers.OrdersController.ToSummaryDto).ToList());
    }

    /// <summary>
    /// Gets the details of a specific order by its ID.
    /// </summary>
    /// <param name="id">The ID of the order to retrieve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The details of the specified order.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<OrderDto>> GetById(long id, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id, ct);

        return order is null
            ? throw new ResourceNotFoundException($"Pasūtījums ar ID {id} nav atrasts.")
            : Ok(Controllers.OrdersController.ToDto(order));
    }

    /// <summary>
    /// Updates the status of a specific order. The status transition must follow the defined workflow:
    /// pending -> confirmed -> processing -> shipped -> delivered, with
    /// cancelled/refunded reachable as exceptions.
    /// The DB trigger trg_order_status_log already appends an order_status_history row on
    /// every UPDATE; this action patches that row afterwards with
    /// changed_by/note since the trigger itself only knows the new status.
    /// </summary>
    /// <param name="id">The ID of the order to update.</param>
    /// <param name="request">The request containing the new status and optional note.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="BadRequestException"></exception>
    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> UpdateStatus(long id, OrderStatusUpdateRequest request, CancellationToken ct)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);

        if (order is null)
        {
            throw new ResourceNotFoundException($"Pasūtījums ar ID {id} nav atrasts.");
        }

        if (!Enum.TryParse<OrderStatus>(request.Status, ignoreCase: true, out var newStatus))
        {
            throw new BadRequestException($"'{request.Status}' nav atpazīts pasūtījuma statuss.", "Nederīgs statuss");
        }

        if (TerminalStatuses.Contains(order.Status))
        {
            throw new BadRequestException($"Pasūtījumu ar statusu {order.Status} vairs nevar mainīt.", "Pasūtījums ir pabeigts");
        }

        var isAllowedTransition = (order.Status, newStatus) switch
        {
            (OrderStatus.Pending, OrderStatus.Confirmed) => true,
            (OrderStatus.Pending, OrderStatus.Cancelled) => true,
            (OrderStatus.Confirmed, OrderStatus.Processing) => true,
            (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
            (OrderStatus.Processing, OrderStatus.Shipped) => true,
            (OrderStatus.Processing, OrderStatus.Cancelled) => true,
            (OrderStatus.Shipped, OrderStatus.Delivered) => true,
            (OrderStatus.Shipped, OrderStatus.Refunded) => true,
            (OrderStatus.Delivered, OrderStatus.Refunded) => true,
            _ => false,
        };

        if (!isAllowedTransition)
        {
            throw new BadRequestException($"Nederīga statusa maiņa no {order.Status} uz {newStatus}.", "Nederīga statusa maiņa");
        }

        order.Status = newStatus;
        await _db.SaveChangesAsync(ct);

        var historyRow = await _db.Set<Models.Entities.OrderStatusHistory>()
            .Where(h => h.OrderId == order.Id)
            .OrderByDescending(h => h.Id)
            .FirstOrDefaultAsync(ct);

        if (historyRow is not null)
        {
            historyRow.ChangedBy = _currentUser.UserId;
            historyRow.Note = request.Note;
            await _db.SaveChangesAsync(ct);
        }

        return NoContent();
    }
}
