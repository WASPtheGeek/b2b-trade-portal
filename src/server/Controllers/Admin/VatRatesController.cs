using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// Admin controller exposing the VAT rates available to assign to products.
/// </summary>
[ApiController]
[Route("api/admin/vat-rates")]
[Authorize(Roles = RoleNames.Admin)]
public class VatRatesController : ControllerBase
{
    private readonly ElkaroDbContext _db;

    /// <summary>
    /// Initializes a new instance of the <see cref="VatRatesController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    public VatRatesController(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <summary>
    /// Gets every VAT rate currently valid to assign to a product.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The list of currently valid VAT rates.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VatRateDto>>> List(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var rates = await _db.VatRates
            .Where(r => r.ValidFrom <= today && (r.ValidTo == null || r.ValidTo >= today))
            .OrderByDescending(r => r.IsDefault)
            .ThenBy(r => r.Rate)
            .Select(r => new VatRateDto(r.Id, r.Rate, r.Label, r.IsDefault))
            .ToListAsync(ct);

        return Ok(rates);
    }
}
