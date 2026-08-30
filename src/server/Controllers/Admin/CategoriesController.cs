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
/// Admin controller for managing categories.
/// </summary>
[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = RoleNames.Admin)]
public class CategoriesController : ControllerBase
{
    private readonly ElkaroDbContext _db;

    public CategoriesController(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <summary>
    /// Creates a new category based on the provided request data.
    /// </summary>
    /// <param name="request">The category creation request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The created category.</returns>
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(
        CategoryUpsertRequest request,
        CancellationToken ct)
    {
        var category = new Category
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsCustom = request.IsCustom,
            ShowInMenu = request.ShowInMenu,
            ActiveFrom = request.ActiveFrom,
            ActiveTo = request.ActiveTo,
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(
            nameof(Controllers.CategoriesController.GetBySlug),
            "Categories",
            new { slug = category.Slug },
            Controllers.CategoriesController.ToDto(category)
        );
    }

    /// <summary>
    /// Updates an existing category identified by its ID with the provided request data.
    /// </summary>
    /// <param name="id">The ID of the category to update.</param>
    /// <param name="request">The category update request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, CategoryUpsertRequest request, CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category is null)
        {
            throw new ResourceNotFoundException($"Kategorija ar ID {id} nav atrasta.");
        }

        category.ParentId = request.ParentId;
        category.Name = request.Name;
        category.Slug = request.Slug;
        category.Description = request.Description;
        category.SortOrder = request.SortOrder;
        category.IsCustom = request.IsCustom;
        category.ShowInMenu = request.ShowInMenu;
        category.ActiveFrom = request.ActiveFrom;
        category.ActiveTo = request.ActiveTo;

        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    /// <summary>
    /// Deletes a category identified by its ID. 
    /// This operation cascades to child categories as per the database schema's foreign key constraints.
    /// </summary>
    /// <param name="id">The ID of the category to delete.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>No content if the operation is successful.</returns>
    /// <exception cref="ResourceNotFoundException"></exception>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category is null)
        {
            throw new ResourceNotFoundException($"Kategorija ar ID {id} nav atrasta.");
        }

        // Cascades to children per schema FK (ON DELETE CASCADE) — confirm
        // that's really wanted before deleting a top-level catalog node.
        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
