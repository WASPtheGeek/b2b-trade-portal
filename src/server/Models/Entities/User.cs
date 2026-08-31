using Elkaro.Server.Models.Enums;

namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a registered business user account.
/// </summary>
public class User
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user's role.
    /// </summary>
    public short RoleId { get; set; }

    /// <summary>
    /// Gets or sets the user's role.
    /// </summary>
    public Role Role { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string FirstName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string LastName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user's business name, if applicable.
    /// </summary>
    public string? BusinessName { get; set; }

    /// <summary>
    /// Gets or sets the user's business registration number, if applicable.
    /// </summary>
    public string? RegistrationNumber { get; set; }

    /// <summary>
    /// Gets or sets the user's VAT number, if applicable.
    /// </summary>
    public string? VatNumber { get; set; }

    /// <summary>
    /// Gets or sets the user's phone number, if any.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = null!;

    /// <summary>
    /// Gets or sets the hashed password used to authenticate the user.
    /// </summary>
    public string PasswordHash { get; set; } = null!;

    /// <summary>
    /// Gets or sets a value indicating whether the user's orders are exempt from VAT.
    /// </summary>
    public bool IsVatExempt { get; set; }

    /// <summary>
    /// Gets or sets the current approval status of the user's account.
    /// </summary>
    public UserStatus Status { get; set; } = UserStatus.Pending;

    /// <summary>
    /// Gets or sets the identifier of the admin who approved or rejected the account, if any.
    /// </summary>
    public long? ApprovedBy { get; set; }

    /// <summary>
    /// Gets or sets the admin who approved or rejected the account, if any.
    /// </summary>
    public User? ApprovedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the account was approved or rejected, if any.
    /// </summary>
    public DateTimeOffset? ApprovedAt { get; set; }

    /// <summary>
    /// Gets or sets the reason the account was rejected, if applicable.
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the account was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the account was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
