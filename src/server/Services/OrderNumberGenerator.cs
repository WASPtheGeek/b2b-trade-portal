using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Services;

/// <summary>
/// Provides functionality for generating unique order numbers in a human-readable format.
/// </summary>
public class OrderNumberGenerator : IOrderNumberGenerator
{
    private readonly ElkaroDbContext _db;

    public OrderNumberGenerator(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <inheritdoc/>
    public async Task<string> NextAsync(CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"ORD-{year}-";

        // Count the number of orders for the current year to determine the next order number.
        // Orders placed this year + 1.
        var countThisYear = await _db.Orders
            .Where(o => o.OrderNumber.StartsWith(prefix))
            .CountAsync(ct);

        return $"{prefix}{(countThisYear + 1):D6}";
    }
}