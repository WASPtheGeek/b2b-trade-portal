using Ardalis.GuardClauses;
using Elkaro.Server.Common.Exceptions;
using Elkaro.Server.Data;
using Elkaro.Server.Dtos;
using Elkaro.Server.Models.Constants;
using Elkaro.Server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Controllers.Admin;

/// <summary>
/// Admin controller exposing the brands available to assign to products.
/// </summary>
[ApiController]
[Route("api/admin/brands")]
[Authorize(Roles = RoleNames.Admin)]
public class BrandsController : ControllerBase
{
    private readonly ElkaroDbContext _db;

    /// <summary>
    /// Initializes a new instance of the <see cref="BrandsController"/> class.
    /// </summary>
    /// <param name="db">The database context.</param>
    public BrandsController(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <summary>
    /// Gets every brand available to assign to a product.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The list of brands.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BrandDto>>> List(CancellationToken ct)
    {
        var brands = await _db.Brands
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto(b.Id, b.Name))
            .ToListAsync(ct);

        return Ok(brands);
    }

    /// <summary>
    /// Creates a new brand.
    /// </summary>
    /// <param name="request">The brand creation request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The created brand.</returns>
    /// <exception cref="ConflictException"></exception>
    [HttpPost]
    public async Task<ActionResult<BrandDto>> Create(BrandUpsertRequest request, CancellationToken ct)
    {
        if (await _db.Brands.AnyAsync(b => b.Name == request.Name, ct))
        {
            throw new ConflictException($"Zīmols ar nosaukumu '{request.Name}' jau pastāv.", "Dublēts nosaukums");
        }

        var brand = new Brand
        {
            Name = request.Name,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Brands.Add(brand);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(List), null, new BrandDto(brand.Id, brand.Name));
    }

    /// <summary>
    /// Updates an existing brand's name.
    /// </summary>
    /// <param name="id">The ID of the brand to update.</param>
    /// <param name="request">The brand update request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the update is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="ConflictException"></exception>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, BrandUpsertRequest request, CancellationToken ct)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, ct);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Zīmols ar ID {id} nav atrasts.");
        }

        var hasDuplicate = await _db.Brands.AnyAsync(b => b.Name == request.Name && b.Id != id, ct);

        if (brand.Name != request.Name && hasDuplicate)
        {
            throw new ConflictException($"Zīmols ar nosaukumu '{request.Name}' jau pastāv.", "Dublēts nosaukums");
        }

        brand.Name = request.Name;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Deletes a brand. Products referencing it keep their brand reference cleared
    /// (the schema's foreign key is ON DELETE SET NULL) rather than being blocked or deleted.
    /// </summary>
    /// <param name="id">The ID of the brand to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, ct);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Zīmols ar ID {id} nav atrasts.");
        }

        _db.Brands.Remove(brand);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
