namespace Elkaro.Server.Services;

/// <summary>
/// Defines a service for generating unique order numbers in a human-readable format.
/// </summary>
public interface IOrderNumberGenerator
{
    /// <summary>
    /// Generates the next order number in a human-readable format, such as ORD-2026-000123.
    /// Callers must handle potential unique-constraint violations in concurrent scenarios, 
    /// as this method does not acquire a database lock.
    /// </summary>
    Task<string> NextAsync(CancellationToken ct = default);
}
