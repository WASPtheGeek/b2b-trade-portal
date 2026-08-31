using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Scope is OR'd across three optional junction sets (category / brand /
/// client) — an empty junction set for one dimension means "no restriction
/// on that dimension", not "excludes everything". See
/// b2b_ecommerce_schema.sql Section 4 design note 5 and
/// PromotionsService.IsApplicable below.
/// </summary>
public class Promotion
{
    /// <summary>
    /// Gets or sets the unique identifier for the promotion.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the promotion.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets the description of the promotion, if any.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of discount the promotion applies.
    /// </summary>
    public DiscountType DiscountType { get; set; }

    /// <summary>
    /// Gets or sets the discount value, interpreted according to <see cref="DiscountType"/>.
    /// </summary>
    public decimal DiscountValue { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the promotion becomes active.
    /// </summary>
    public DateTimeOffset StartsAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the promotion stops being active.
    /// </summary>
    public DateTimeOffset EndsAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the promotion is enabled.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the identifier of the user who created the promotion, if any.
    /// </summary>
    public long? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the promotion was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the promotion was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<PromotionCategory> Categories { get; set; } = new List<PromotionCategory>();
    public ICollection<PromotionBrand> Brands { get; set; } = new List<PromotionBrand>();
    public ICollection<PromotionClient> Clients { get; set; } = new List<PromotionClient>();
}

/// <summary>
/// Join entity restricting a promotion to a specific category.
/// </summary>
public class PromotionCategory
{
    /// <summary>
    /// Gets or sets the identifier of the promotion.
    /// </summary>
    public long PromotionId { get; set; }

    /// <summary>
    /// Gets or sets the promotion this scope entry belongs to.
    /// </summary>
    public Promotion Promotion { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the category the promotion is restricted to.
    /// </summary>
    public long CategoryId { get; set; }

    /// <summary>
    /// Gets or sets the category the promotion is restricted to.
    /// </summary>
    public Category Category { get; set; } = null!;
}

/// <summary>
/// Join entity restricting a promotion to a specific brand.
/// </summary>
public class PromotionBrand
{
    /// <summary>
    /// Gets or sets the identifier of the promotion.
    /// </summary>
    public long PromotionId { get; set; }

    /// <summary>
    /// Gets or sets the promotion this scope entry belongs to.
    /// </summary>
    public Promotion Promotion { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the brand the promotion is restricted to.
    /// </summary>
    public long BrandId { get; set; }

    /// <summary>
    /// Gets or sets the brand the promotion is restricted to.
    /// </summary>
    public Brand Brand { get; set; } = null!;
}

/// <summary>
/// Join entity restricting a promotion to a specific client (user).
/// </summary>
public class PromotionClient
{
    /// <summary>
    /// Gets or sets the identifier of the promotion.
    /// </summary>
    public long PromotionId { get; set; }

    /// <summary>
    /// Gets or sets the promotion this scope entry belongs to.
    /// </summary>
    public Promotion Promotion { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the client the promotion is restricted to.
    /// </summary>
    public long UserId { get; set; }

    /// <summary>
    /// Gets or sets the client the promotion is restricted to.
    /// </summary>
    public User User { get; set; } = null!;
}
