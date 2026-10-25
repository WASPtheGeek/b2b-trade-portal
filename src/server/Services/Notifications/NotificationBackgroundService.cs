using Ardalis.GuardClauses;
using Microsoft.Extensions.Options;

namespace Elkaro.Server.Services.Notifications;

/// <summary>
/// Periodically polls the notification outbox and sends pending emails. Each poll gets its own
/// scope, since <see cref="Data.ElkaroDbContext"/> is scoped.
/// </summary>
public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly NotificationOptions _options;
    private readonly ILogger<NotificationBackgroundService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationBackgroundService"/> class.
    /// </summary>
    /// <param name="scopeFactory">The service scope factory.</param>
    /// <param name="options">The notification options.</param>
    /// <param name="logger">The logger instance.</param>
    public NotificationBackgroundService(
        IServiceScopeFactory scopeFactory,
        IOptions<NotificationOptions> options,
        ILogger<NotificationBackgroundService> logger)
    {
        _scopeFactory = Guard.Against.Null(scopeFactory, nameof(scopeFactory));
        _options = Guard.Against.Null(options, nameof(options)).Value;
        _logger = Guard.Against.Null(logger, nameof(logger));
    }

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(_options.PollIntervalSeconds));

        do
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dispatcher = scope.ServiceProvider.GetRequiredService<INotificationDispatcher>();

                // Keep draining while full batches come back, so a backlog clears without
                // waiting a poll interval per batch.
                while (await dispatcher.DispatchPendingAsync(stoppingToken) >= _options.BatchSize)
                {
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Notification dispatch cycle failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
