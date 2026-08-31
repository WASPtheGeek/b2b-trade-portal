namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a product a user has saved to their wishlist.
/// </summary>
public class WishlistItem
{
    /// <summary>
    /// Gets or sets the unique identifier for the wishlist item.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user the wishlist item belongs to.
    /// </summary>
    public long UserId { get; set; }

    /// <summary>
    /// Gets or sets the user the wishlist item belongs to.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Gets or sets the identifier of the product added to the wishlist.
    /// </summary>
    public long ProductId { get; set; }

    /// <summary>
    /// Gets or sets the product added to the wishlist.
    /// </summary>
    public Product Product { get; set; } = null!;

    /// <summary>
    /// Gets or sets the date and time when the product was added to the wishlist.
    /// </summary>
    public DateTimeOffset AddedAt { get; set; }
}
