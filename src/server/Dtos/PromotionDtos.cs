using System.ComponentModel.DataAnnotations;

namespace Elkaro.Server.Dtos;

/// <summary>
/// This DTO represents a promotion in the system.
/// </summary>
/// <param name="Id">The unique identifier of the promotion.</param>
/// <param name="Name">The name of the promotion.</param>
/// <param name="Description">The description of the promotion.</param>
/// <param name="DiscountType">The type of discount ("percentage" or "fixed").</param>
/// <param name="DiscountValue">The value of the discount.</param>
/// <param name="StartsAt">The start date and time of the promotion.</param>
/// <param name="EndsAt">The end date and time of the promotion.</param>
/// <param name="IsActive">Indicates whether the promotion is active.</param>
/// <param name="CategoryIds">The IDs of the categories associated with the promotion.</param>
/// <param name="BrandIds">The IDs of the brands associated with the promotion.</param>
/// <param name="ClientUserIds">The IDs of the client users associated with the promotion.</param>
public record PromotionDto(
    long Id,
    string Name,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive,
    IReadOnlyList<long> CategoryIds,
    IReadOnlyList<long> BrandIds,
    IReadOnlyList<long> ClientUserIds);

/// <summary>
/// This DTO represents a request to create or update a promotion.
/// </summary>
public record PromotionUpsertRequest
{
    /// <summary>
    /// Gets or initializes the name of the promotion.
    /// </summary>
    [Required, MaxLength(150)]
    public string Name { get; init; } = null!;

    /// <summary>
    /// Gets or initializes the description of the promotion.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets or initializes the type of discount for the promotion.
    /// </summary>
    [Required]
    public string DiscountType { get; init; } = "percentage";

    /// <summary>
    /// Gets or initializes the value of the discount for the promotion.
    /// </summary>
    [Range(0.01, double.MaxValue)]
    public decimal DiscountValue { get; init; }

    /// <summary>
    /// Gets or initializes the start date and time of the promotion.
    /// </summary>
    [Required]
    public DateTimeOffset StartsAt { get; init; }

    /// <summary>
    /// Gets or initializes the end date and time of the promotion.
    /// </summary>
    [Required]
    public DateTimeOffset EndsAt { get; init; }

    /// <summary>
    /// Gets or initializes a value indicating whether the promotion is active.
    /// </summary>
    public bool IsActive { get; init; } = true;

    /// <summary>
    /// Gets or initializes the list of category IDs associated with the promotion.
    /// </summary>
    public List<long> CategoryIds { get; init; } = new();

    /// <summary>
    /// Gets or initializes the list of brand IDs associated with the promotion.
    /// </summary>
    public List<long> BrandIds { get; init; } = new();

    /// <summary>
    /// Gets or initializes the list of client user IDs associated with the promotion.
    /// </summary>
    public List<long> ClientUserIds { get; init; } = new();
}

/// <summary>
/// This DTO represents a request to update the status (active/inactive) of a promotion.
/// </summary>
/// <param name="IsActive">Indicates whether the promotion is active.</param>
public record PromotionStatusUpdateRequest(bool IsActive);
