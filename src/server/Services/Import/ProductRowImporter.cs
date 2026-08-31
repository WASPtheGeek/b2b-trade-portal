using System.Globalization;
using Ardalis.GuardClauses;
using Elkaro.Server.Data;
using Elkaro.Server.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Elkaro.Server.Services.Import;

public record RowImportResult(bool Success, bool Created, string? ErrorMessage);

/// <summary>
/// Product row importer, responsible for upserting products based on EAN.
/// Designed to be used within a single import batch, 
/// caching lookups for the lifetime of the importer instance to minimize database round-trips.
/// </summary>
public class ProductRowImporter
{
    private readonly ElkaroDbContext _db;
    private readonly Dictionary<string, long> _categoryCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, long> _brandCache = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Default VAT rate ID, cached for the lifetime of this importer instance.
    /// Lazily loaded on first use.
    /// </summary>
    private short? _defaultVatRateId;

    public ProductRowImporter(ElkaroDbContext db) => _db = Guard.Against.Null(db, nameof(db));

    /// <summary>
    /// Imports a single product row, performing upsert logic based on the EAN field.
    /// </summary>
    /// <param name="row">The raw import row to be imported.</param>
    /// <param name="ct">A cancellation token.</param>
    /// <returns>A <see cref="RowImportResult"/> indicating the outcome of the import operation.</returns>
    public async Task<RowImportResult> ImportRowAsync(RawImportRow row, CancellationToken ct = default)
    {
        // --- required fields -------------------------------------------------
        if (string.IsNullOrWhiteSpace(row.Ean))
        {
            return new RowImportResult(false, false, "EAN is required — it is the upsert key for this import.");
        }

        if (string.IsNullOrWhiteSpace(row.Name))
        {
            return new RowImportResult(false, false, "Nosaukums (name) is required.");
        }

        if (!TryParsePrice(row.PriceRaw, out var price))
        {
            return new RowImportResult(false, false, $"Could not parse Cena '{row.PriceRaw}' as a price.");
        }

        var soldByPiece = ParseFlag(row.SoldByPieceRaw, defaultValue: true);
        var piecesPerPackage = TryParseInt(row.PiecesPerPackageRaw);
        var piecesPerBox = TryParseInt(row.PiecesPerBoxRaw);

        // Reject rows that could never be ordered — see claude/api-design.md §5.
        if (!soldByPiece && piecesPerPackage is null && piecesPerBox is null)
        {
            return new RowImportResult(false, false,
                "gb=0 (not sellable by the piece) but both iep. and kaste are empty — this product could never be ordered.");
        }

        // --- lookups / get-or-create ------------------------------------------
        long? brandId = string.IsNullOrWhiteSpace(row.Brand) ? null : await GetOrCreateBrandAsync(row.Brand!, ct);
        var categoryId = await GetOrCreateCategoryChainAsync(row.Catalog, row.Group, row.Subgroup, ct);
        var vatRateId = await GetDefaultVatRateIdAsync(ct);

        // --- upsert product by EAN --------------------------------------------
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Ean == row.Ean, ct);
        var created = product is null;

        if (product is null)
        {
            product = new Product
            {
                // The supplier file has no SKU column — EAN is the closest
                // thing to a stable natural key, so it doubles as the SKU on
                // create. Revisit if a real SKU scheme is introduced later.
                Sku = row.Ean!,
                Ean = row.Ean,
                DateAdded = DateOnly.FromDateTime(DateTime.UtcNow),
            };
            _db.Products.Add(product);
        }

        product.Name = row.Name!.Trim();
        product.Description = row.Description;
        product.BasePrice = price;
        product.VatRateId = vatRateId;
        product.BrandId = brandId;
        product.SoldByPiece = soldByPiece;
        product.PiecesPerPackage = piecesPerPackage;
        product.PiecesPerBox = piecesPerBox;
        product.IsActive = true;

        await _db.SaveChangesAsync(ct); // need product.Id for the join row below

        if (categoryId is not null)
        {
            var existingLink = await _db.ProductCategories
                .FirstOrDefaultAsync(pc => pc.ProductId == product.Id && pc.IsPrimary, ct);

            if (existingLink is null)
            {
                _db.ProductCategories.Add(new ProductCategory
                {
                    ProductId = product.Id,
                    CategoryId = categoryId.Value,
                    IsPrimary = true,
                });
            }
            else if (existingLink.CategoryId != categoryId.Value)
            {
                existingLink.CategoryId = categoryId.Value;
            }

            await _db.SaveChangesAsync(ct);
        }

        return new RowImportResult(true, created, null);
    }

    /// <summary>
    /// Tries to parse a raw string as a decimal price, normalizing common formatting issues.
    /// </summary>
    /// <param name="raw">The raw string representation of the price.</param>
    /// <param name="price">The parsed decimal price if successful; otherwise, 0.</param>
    /// <returns>True if parsing was successful and the price is non-negative; otherwise, false.</returns>
    private static bool TryParsePrice(string? raw, out decimal price)
    {
        price = 0;

        if (string.IsNullOrWhiteSpace(raw))
        {
            return false;
        }

        var normalized = raw.Trim().Replace(" ", "").Replace(',', '.');

        return decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out price) && price >= 0;
    }

    /// <summary>
    /// Parses a raw string as a boolean flag, interpreting common truthy values.
    /// </summary>
    /// <param name="raw">The raw string representation of the flag.</param>
    /// <param name="defaultValue">The default value to return if parsing fails.</param>
    /// <returns>True if the raw string represents a truthy value; otherwise, the default value.</returns>
    private static bool ParseFlag(string? raw, bool defaultValue)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return defaultValue;
        }

        var trimmed = raw.Trim();

        return trimmed is "1" or "true" or "True" or "TRUE";
    }

    /// <summary>
    /// Tries to parse a raw string as a positive integer.
    /// </summary>
    /// <param name="raw">The raw string representation of the integer.</param>
    /// <returns>The parsed positive integer if successful; otherwise, null.</returns>
    private static int? TryParseInt(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;

        return int.TryParse(raw.Trim(), out var value) && value > 0 ? value : null;
    }

    /// <summary>
    /// Gets or creates a brand by name, caching the result for the lifetime of this importer instance.
    /// </summary>
    /// <param name="name">The name of the brand.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The ID of the existing or newly created brand.</returns>
    private async Task<long> GetOrCreateBrandAsync(string name, CancellationToken ct)
    {
        var key = name.Trim();
        if (_brandCache.TryGetValue(key, out var cached))
        {
            return cached;
        }

        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Name == key, ct);

        if (brand is null)
        {
            brand = new Brand { Name = key };
            _db.Brands.Add(brand);
            await _db.SaveChangesAsync(ct);
        }

        _brandCache[key] = brand.Id;

        return brand.Id;
    }

    /// <summary>
    /// Gets or creates a category chain based on the provided catalog, group, and subgroup names.
    /// Caches the deepest category ID for the lifetime of this importer instance.
    /// </summary>
    /// <param name="catalog">The name of the catalog.</param>
    /// <param name="group">The name of the group.</param>
    /// <param name="subgroup">The name of the subgroup.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The ID of the deepest category in the chain if successful; otherwise, null.</returns>
    private async Task<long?> GetOrCreateCategoryChainAsync(
        string? catalog,
        string? group,
        string? subgroup,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(catalog))
        {
            return null;
        }

        long? parentId = null;
        long? deepestId = null;

        foreach (var level in new[] { catalog, group, subgroup })
        {
            if (string.IsNullOrWhiteSpace(level)) break;
            deepestId = await GetOrCreateCategoryAsync(level.Trim(), parentId, ct);
            parentId = deepestId;
        }

        return deepestId;
    }

    /// <summary>
    /// Gets or creates a category by name and parent ID, caching the result for the lifetime of this importer instance.
    /// </summary>
    /// <param name="name">The name of the category.</param>
    /// <param name="parentId">The ID of the parent category, or null if this is a root category.</param>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The ID of the category.</returns>
    private async Task<long> GetOrCreateCategoryAsync(string name, long? parentId, CancellationToken ct)
    {
        var cacheKey = $"{parentId?.ToString() ?? "root"}::{name}";

        if (_categoryCache.TryGetValue(cacheKey, out var cached))
        {
            return cached;
        }

        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Name == name && c.ParentId == parentId, ct);

        if (category is null)
        {
            category = new Category
            {
                Name = name,
                Slug = Slugify(name),
                ParentId = parentId,
            };
            _db.Categories.Add(category);
            await _db.SaveChangesAsync(ct);
        }

        _categoryCache[cacheKey] = category.Id;

        return category.Id;
    }

    /// <summary>
    /// Gets the default VAT rate ID, caching it for the lifetime of this importer instance.
    /// </summary>
    /// <param name="ct">The cancellation token.</param>
    /// <returns>The ID of the default VAT rate.</returns>
    /// <exception cref="InvalidOperationException"></exception>
    private async Task<short> GetDefaultVatRateIdAsync(CancellationToken ct)
    {
        if (_defaultVatRateId is not null)
        {
            return _defaultVatRateId.Value;
        }

        var rate = await _db.VatRates.FirstOrDefaultAsync(v => v.IsDefault, ct)
            ?? throw new InvalidOperationException("No default VAT rate configured (vat_rates.is_default) — seed one before importing.");

        _defaultVatRateId = rate.Id;

        return rate.Id;
    }

    /// <summary>
    /// Slugifies a category name to create a URL-friendly identifier.
    /// </summary>
    /// <param name="name">The name of the category.</param>
    /// <returns>The slugified version of the category name.</returns>
    private static string Slugify(string name)
    {
        var lowered = name.Trim().ToLowerInvariant();
        var chars = lowered.Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray();
        var slug = new string(chars);

        while (slug.Contains("--")) slug = slug.Replace("--", "-");

        return slug.Trim('-');
    }
}
