namespace Elkaro.Server.Models.Entities;

/// <summary>
/// Represents a user role (e.g. business, admin).
/// </summary>
public class Role
{
    /// <summary>
    /// Gets or sets the unique identifier for the role.
    /// </summary>
    public short Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the role (e.g. business, admin).
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Gets or sets the description of the role, if any.
    /// </summary>
    public string? Description { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}
