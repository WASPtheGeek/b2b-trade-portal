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
/// The products controller for admin operations,
/// allowing authorized users to manage products in the system.
/// </summary>
[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = RoleNames.Admin)]
public class ProductsController : ControllerBase
{
    private readonly ElkaroDbContext _db;

    /// <summary>
    /// Initializes a new instance of the <see cref="ProductsController"/> class.
    /// </summary>
    /// <param name="db">The database context instance.</param>
    public ProductsController(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <summary>
    /// Creates a new product in the system.
    /// </summary>
    /// <param name="request">The product details to create.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The created product.</returns>
    /// <exception cref="ConflictException"></exception>
    [HttpPost]
    public async Task<ActionResult<ProductUpsertRequest>> Create(ProductUpsertRequest request, CancellationToken ct)
    {
        if (await _db.Products.AnyAsync(p => p.Sku == request.Sku, ct))
        {
            throw new ConflictException(
                $"Produkts ar SKU '{request.Sku}' jau pastāv.",
                "Dublēts SKU");
        }

        var product = new Product
        {
            Sku = request.Sku,
            Name = request.Name,
            Description = request.Description,
            BasePrice = request.BasePrice,
            VatRateId = request.VatRateId,
            BrandId = request.BrandId,
            Ean = request.Ean,
            SoldByPiece = request.SoldByPiece,
            PiecesPerBox = request.PiecesPerBox,
            PiecesPerPackage = request.PiecesPerPackage,
            IsActive = request.IsActive,
            DateAdded = DateOnly.FromDateTime(DateTime.UtcNow),
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        await SetCategoriesAsync(product.Id, request.CategoryIds, ct);

        return CreatedAtAction(
            nameof(Controllers.ProductsController.GetById),
            "Products",
            new { id = product.Id },
            request
        );
    }

    /// <summary>
    /// Updates an existing product in the system.
    /// </summary>
    /// <param name="id">The ID of the product to update.</param>
    /// <param name="request">The updated product details.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the update is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    /// <exception cref="ConflictException"></exception>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(
        long id,
        ProductUpsertRequest request,
        CancellationToken ct)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null)
        {
            throw new ResourceNotFoundException($"Produkts ar ID {id} nav atrasts.");
        }

        var hasProduct = await _db.Products
            .AnyAsync(p => p.Sku == request.Sku && p.Id != id, ct);

        if (product.Sku != request.Sku && hasProduct)
        {
            throw new ConflictException($"Produkts ar SKU '{request.Sku}' jau pastāv.", "Dublēts SKU");
        }

        product.Sku = request.Sku;
        product.Name = request.Name;
        product.Description = request.Description;
        product.BasePrice = request.BasePrice;
        product.VatRateId = request.VatRateId;
        product.BrandId = request.BrandId;
        product.Ean = request.Ean;
        product.SoldByPiece = request.SoldByPiece;
        product.PiecesPerBox = request.PiecesPerBox;
        product.PiecesPerPackage = request.PiecesPerPackage;
        product.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);

        await SetCategoriesAsync(product.Id, request.CategoryIds, ct);

        return NoContent();
    }

    /// <summary>
    /// Deletes a product from the system. 
    /// This is a soft delete operation — a product referenced by
    /// past order_items must never be hard-deleted.
    /// </summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null)
        {
            throw new ResourceNotFoundException($"Produkts ar ID {id} nav atrasts.");
        }

        product.IsActive = false;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Updates the active status of a product.
    /// </summary>
    /// <param name="id">The ID of the product to update.</param>
    /// <param name="request">The request containing the new active status.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>No content if the update is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> UpdateStatus(
        long id,
        ProductStatusUpdateRequest request,
        CancellationToken ct)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null)
        {
            throw new ResourceNotFoundException($"Produkts ar ID {id} nav atrasts.");
        }

        product.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Sets the categories for a product, ensuring that the first category in the list is marked as primary.
    /// If the product already has categories, they will be replaced with the new list.
    /// </summary>
    /// <param name="productId">The ID of the product.</param>
    /// <param name="categoryIds">The list of category IDs to associate with the product.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    private async Task SetCategoriesAsync(
        long productId,
        List<long> categoryIds,
        CancellationToken ct)
    {
        var existing = await _db.ProductCategories
            .Where(pc => pc.ProductId == productId)
            .ToListAsync(ct);

        _db.ProductCategories.RemoveRange(existing);

        for (var i = 0; i < categoryIds.Count; i++)
        {
            _db.ProductCategories.Add(new ProductCategory
            {
                ProductId = productId,
                CategoryId = categoryIds[i],
                IsPrimary = i == 0,
            });
        }
        await _db.SaveChangesAsync(ct);
    }
}
