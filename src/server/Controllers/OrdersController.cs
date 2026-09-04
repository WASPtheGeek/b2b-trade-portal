using Ardalis.GuardClauses;
using Elkaro.Server.Common;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Entities;
using Elkaro.Server.Models.Enums;
using Elkaro.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Elkaro.Server.Controllers;

/// <summary>
/// The orders controller for managing user orders, including
/// creating, listing, retrieving, canceling, and reordering.
/// </summary>
[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ElkaroDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IPricingService _pricing;
    private readonly IOrderNumberGenerator _orderNumbers;

    /// <summary>
    /// Initializes a new instance of the <see cref="OrdersController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    /// <param name="currentUser">The current user service.</param>
    /// <param name="pricing">The pricing service.</param>
    /// <param name="orderNumbers">The order number generator service.</param>
    public OrdersController(ElkaroDbContext db, ICurrentUserService currentUser, IPricingService pricing, IOrderNumberGenerator orderNumbers)
    {
        _db = Guard.Against.Null(db, nameof(db));
        _currentUser = Guard.Against.Null(currentUser, nameof(currentUser));
        _pricing = Guard.Against.Null(pricing, nameof(pricing));
        _orderNumbers = Guard.Against.Null(orderNumbers, nameof(orderNumbers));
    }

    /// <summary>
    /// Creates a new order for the currently authenticated user.
    /// </summary>
    /// <param name="request">The order creation request containing order items and optional notes.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The created order details.</returns>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;

        var productIds = request.Items
            .Select(i => i.ProductId)
            .Distinct()
            .ToList();

        var products = await _db.Products
            .Include(p => p.VatRate)
            .Include(p => p.Brand)
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, ct);

        var lineErrors = new List<string>();

        // Validate unit selected is correct for the product.
        foreach (var item in request.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product) || !product.IsActive)
            {
                lineErrors.Add($"Produkts {item.ProductId} neeksistē vai nav pieejams.");

                continue;
            }

            if (!TryParsePackagingUnit(item.PackagingUnit, out var unit))
            {
                lineErrors.Add($"'{item.PackagingUnit}' nav derīga iepakojuma vienība produktam {item.ProductId}.");

                continue;
            }

            if (!product.SupportsUnit(unit))
            {
                lineErrors.Add($"Produktu '{product.Name}' nevar pasūtīt, izmantojot {item.PackagingUnit}.");
            }
        }

        if (lineErrors.Count > 0)
        {
            throw new BadRequestException(string.Join(" ", lineErrors), "Nederīgas pasūtījuma pozīcijas");
        }

        var prices = await _pricing.ResolveUnitPricesAsync(products.Values, userId, ct);

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            Notes = request.Notes,
        };

        foreach (var item in request.Items)
        {
            var product = products[item.ProductId];

            // Validate unit
            TryParsePackagingUnit(item.PackagingUnit, out var unit);

            var piecesPerUnit = product.PiecesPerUnit(unit);
            var unitPrice = prices[product.Id].UnitPrice;

            // Calculate line totals
            var lineSubtotal = Math.Round(item.Quantity * piecesPerUnit * unitPrice, 2);
            var lineVat = Math.Round(lineSubtotal * product.VatRate.Rate / 100m, 2);

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                SkuSnapshot = product.Sku,
                ProductNameSnapshot = product.Name,
                BrandSnapshot = product.Brand?.Name,
                PackagingUnitUsed = unit,
                PiecesPerUnitSnapshot = piecesPerUnit,
                Quantity = item.Quantity,
                UnitPriceSnapshot = unitPrice,
                VatRateSnapshot = product.VatRate.Rate,
                LineSubtotal = lineSubtotal,
                LineVatAmount = lineVat,
                LineTotal = lineSubtotal + lineVat,
            });
        }

        if (request.ShippingAddressId is not null)
        {
            var addr = await GetOwnedAddressAsync(request.ShippingAddressId.Value, userId, ct);
            if (addr is null) throw new BadRequestException("Nederīga piegādes adrese.", "Nederīga shippingAddressId");
            order.Addresses.Add(SnapshotAddress(addr, AddressType.Shipping));
        }

        if (request.BillingAddressId is not null)
        {
            var addr = await GetOwnedAddressAsync(request.BillingAddressId.Value, userId, ct);
            if (addr is null) throw new BadRequestException("Nederīga rēķina adrese.", "Nederīga billingAddressId");
            order.Addresses.Add(SnapshotAddress(addr, AddressType.Billing));
        }

        _db.Orders.Add(order);

        // OrderNumberGenerator derives the next number from a COUNT(*), which isn't
        // concurrency-safe: two requests can compute the same number and race to insert.
        // Retry with a freshly generated number on a unique-constraint conflict rather than
        // surfacing it as a 500.
        const int maxAttempts = 5;

        for (var attempt = 1; ; attempt++)
        {
            order.OrderNumber = await _orderNumbers.NextAsync(ct);

            try
            {
                // Inserting order_items fires trg_recalc_order_totals, which
                // rewrites orders.subtotal/vat/total — reload below rather than
                // trusting the in-memory Order.SubtotalAmount (still 0 here).
                await _db.SaveChangesAsync(ct);

                break;
            }
            catch (DbUpdateException ex) when (attempt < maxAttempts && IsOrderNumberConflict(ex))
            {
                // Order stays tracked as Added after a failed save; loop around to
                // regenerate OrderNumber and retry the insert.
            }
        }

        await _db.Entry(order).ReloadAsync(ct);

        return CreatedAtAction(
            nameof(GetById),
            new { id = order.Id },
            await ToDtoAsync(order.Id, ct)
        );
    }

    /// <summary>
    /// Lists the orders of the currently authenticated user, with optional paging.
    /// </summary>
    /// <param name="paging">Paging parameters for the query.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A list of order summaries for the current user.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> ListMine([FromQuery] PagingQuery paging, CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;
        var query = _db.Orders.Include(o => o.User).Where(o => o.UserId == userId);

        var total = await query.CountAsync(ct);
        Response.Headers["X-Total-Count"] = total.ToString();

        var orders = await query
            .OrderByDescending(o => o.PlacedAt)
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(ct);

        return Ok(orders.Select(ToSummaryDto).ToList());
    }

    /// <summary>
    /// Retrieves the details of a specific order by its ID, ensuring that the order belongs 
    /// to the currently authenticated user or that the user has admin privileges.
    /// </summary>
    /// <param name="id">The ID of the order to retrieve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The details of the specified order.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="ForbiddenException"></exception>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<OrderDto>> GetById(long id, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order is null) throw new ResourceNotFoundException($"Pasūtījums ar ID {id} nav atrasts.");
        if (order.UserId != _currentUser.UserId && !_currentUser.IsAdmin) throw new ForbiddenException("Šis pasūtījums jums nepieder.");

        return Ok(ToDto(order));
    }

    /// <summary>
    /// Cancels a pending order for the currently authenticated user.
    /// </summary>
    /// <param name="id">The ID of the order to cancel.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the cancellation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="ForbiddenException"></exception>
    /// <exception cref="BadRequestException"></exception>
    [HttpPost("{id:long}/cancel")]
    public async Task<IActionResult> Cancel(long id, CancellationToken ct)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);

        if (order is null)
        {
            throw new ResourceNotFoundException($"Pasūtījums ar ID {id} nav atrasts.");
        }

        if (order.UserId != _currentUser.UserId)
        {
            throw new ForbiddenException("Šis pasūtījums jums nepieder.");
        }

        if (order.Status != OrderStatus.Pending)
        {
            throw new BadRequestException("Tikai gaidīšanas statusā esošu pasūtījumu var atcelt.", "Atcelšana nav iespējama");
        }

        order.Status = OrderStatus.Cancelled; // trg_order_status_log records this transition automatically
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Reorders a previous order for the currently authenticated user, creating a new order with the same items and quantities.
    /// </summary>
    /// <param name="id">The ID of the order to reorder.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The newly created order.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="ForbiddenException"></exception>
    /// <exception cref="BadRequestException"></exception>
    [HttpPost("{id:long}/reorder")]
    public async Task<ActionResult<OrderDto>> Reorder(long id, CancellationToken ct)
    {
        var userId = _currentUser.UserId!.Value;
        var source = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (source is null)
        {
            throw new ResourceNotFoundException($"Pasūtījums ar ID {id} nav atrasts.");
        }

        if (source.UserId != userId)
        {
            throw new ForbiddenException("Šis pasūtījums jums nepieder.");
        }

        // Use current prices.
        var productIds = source.Items
            .Where(i => i.ProductId is not null)
            .Select(i => i.ProductId!.Value)
            .Distinct()
            .ToList();

        var stillAvailable = await _db.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .Select(p => p.Id)
            .ToListAsync(ct);

        var request = new CreateOrderRequest
        {
            Items = source.Items
                .Where(i => i.ProductId is not null && stillAvailable.Contains(i.ProductId.Value))
                .Select(i => new CreateOrderItemRequest
                {
                    ProductId = i.ProductId!.Value,
                    PackagingUnit = i.PackagingUnitUsed.ToString().ToLowerInvariant(),
                    Quantity = i.Quantity,
                }).ToList(),
            Notes = $"Reorder of {source.OrderNumber}",
        };

        if (request.Items.Count == 0)
        {
            throw new BadRequestException("Neviens no sākotnējiem produktiem vairs nav pieejams.", "Nav ko pasūtīt atkārtoti");
        }

        return await Create(request, ct);
    }

    /// <summary>
    /// Determines whether a <see cref="DbUpdateException"/> was caused by a violation of the
    /// unique constraint on orders.order_number.
    /// </summary>
    /// <param name="ex">The exception raised by a failed <c>SaveChangesAsync</c> call.</param>
    /// <returns>True if the exception represents an order_number uniqueness conflict.</returns>
    private static bool IsOrderNumberConflict(DbUpdateException ex) =>
        ex.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation,
            ConstraintName: "orders_order_number_key",
        };

    /// <summary>
    /// Retrieves a user-owned address by its ID, ensuring that the address belongs to the specified user.
    /// </summary>
    /// <param name="addressId">The ID of the address to retrieve.</param>
    /// <param name="userId">The ID of the user who must own the address.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The user-owned address if found; otherwise, null.</returns>
    private async Task<UserAddress?> GetOwnedAddressAsync(long addressId, long userId, CancellationToken ct) =>
        await _db.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, ct);

    /// <summary>
    /// Creates a snapshot of a user address for an order, preserving the address details at the time of order placement.
    /// </summary>
    /// <param name="a">The user address to snapshot.</param>
    /// <param name="type">The type of the address (e.g., billing, shipping).</param>
    /// <returns>The snapshot of the user address as an <see cref="OrderAddress"/>.</returns>
    private static OrderAddress SnapshotAddress(UserAddress a, AddressType type) => new()
    {
        AddressType = type,
        SourceAddressId = a.Id,
        ContactName = a.ContactName,
        Line1 = a.Line1,
        Line2 = a.Line2,
        City = a.City,
        Region = a.Region,
        PostalCode = a.PostalCode,
        CountryCode = a.CountryCode,
        Phone = a.Phone,
    };

    /// <summary>
    /// Attempts to parse a string representation of a packaging unit into the corresponding <see cref="PackagingUnit"/> enum value.
    /// </summary>
    /// <param name="raw">The string representation of the packaging unit.</param>
    /// <param name="unit">
    /// When this method returns, contains the parsed <see cref="PackagingUnit"/> value 
    /// if the parsing succeeded, or the default value if it failed.
    /// </param>
    /// <returns>True if the parsing was successful, false otherwise.</returns>
    private static bool TryParsePackagingUnit(string raw, out PackagingUnit unit)
    {
        switch (raw.Trim().ToLowerInvariant())
        {
            case "piece": unit = PackagingUnit.Piece; return true;
            case "package": unit = PackagingUnit.Package; return true;
            case "box": unit = PackagingUnit.Box; return true;
            default: unit = default; return false;
        }
    }

    /// <summary>
    /// Converts an order entity to its corresponding DTO representation.
    /// </summary>
    /// <param name="orderId">The ID of the order to convert.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The DTO representation of the order.</returns>
    private async Task<OrderDto> ToDtoAsync(long orderId, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstAsync(o => o.Id == orderId, ct);
        return ToDto(order);
    }

    /// <summary>
    /// Converts an <see cref="Order"/> entity to its corresponding <see cref="OrderDto"/> representation.
    /// </summary>
    /// <param name="o">The order entity to convert.</param>
    /// <returns>The DTO representation of the order.</returns>
    internal static OrderDto ToDto(Order o) => new(
        o.Id, o.OrderNumber, o.Status.ToString(), o.Currency,
        o.SubtotalAmount, o.VatAmount, o.TotalAmount, o.Notes, o.PlacedAt,
        o.Items
            .Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.SkuSnapshot,
                i.ProductNameSnapshot,
                i.BrandSnapshot,
                i.PackagingUnitUsed.ToString().ToLowerInvariant(),
                i.PiecesPerUnitSnapshot,
                i.Quantity,
                i.UnitPriceSnapshot,
                i.VatRateSnapshot,
                i.LineSubtotal,
                i.LineVatAmount,
                i.LineTotal))
            .ToList());

    /// <summary>
    /// Converts an <see cref="Order"/> entity to its corresponding <see cref="OrderSummaryDto"/> representation.
    /// </summary>
    /// <param name="o">The order entity to convert.</param>
    /// <returns>The DTO representation of the order summary.</returns>
    internal static OrderSummaryDto ToSummaryDto(Order o) => new(
        o.Id, o.OrderNumber, o.Status.ToString(), o.Currency, o.TotalAmount, o.PlacedAt, o.UserId, o.User?.BusinessName);
}
