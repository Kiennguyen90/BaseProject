using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Data;
using BaseProject.MachineTools;

namespace BaseProject.MachineTools.DbMigrator;

public class DbMigratorHostedService : IHostedService
{
    private readonly IHostApplicationLifetime _hostApplicationLifetime;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DbMigratorHostedService> _logger;

    public DbMigratorHostedService(
        IHostApplicationLifetime hostApplicationLifetime,
        IConfiguration configuration,
        ILogger<DbMigratorHostedService> logger)
    {
        _hostApplicationLifetime = hostApplicationLifetime;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("=== MachineTools DbMigrator Started ===");
        _logger.LogInformation("Environment: {Env}", Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production");
        _logger.LogInformation("Working directory: {Dir}", Directory.GetCurrentDirectory());

        try
        {
            // Step 1: Apply EF Core migrations BEFORE ABP initialization
            var connectionString = _configuration.GetConnectionString("Default");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                _logger.LogError("Connection string 'Default' is NULL or EMPTY! Check appsettings.json.");
                throw new InvalidOperationException(
                    "Connection string 'Default' is not configured. " +
                    "Ensure appsettings.json exists in the working directory and contains ConnectionStrings:Default.");
            }

            // Mask password for logging
            var maskedCs = MaskConnectionString(connectionString);
            _logger.LogInformation("Connection string: {ConnectionString}", maskedCs);

            _logger.LogInformation("Applying database migrations...");
            var optionsBuilder = new DbContextOptionsBuilder<MachineToolsDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            await using (var dbContext = new MachineToolsDbContext(optionsBuilder.Options))
            {
                // Log pending migrations
                var pending = await dbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                var pendingList = pending.ToList();

                if (pendingList.Count == 0)
                {
                    _logger.LogInformation("No pending migrations — database schema is up to date.");
                }
                else
                {
                    _logger.LogInformation("Pending migrations ({Count}): {Migrations}",
                        pendingList.Count, string.Join(", ", pendingList));
                }

                await dbContext.Database.MigrateAsync(cancellationToken);

                // Verify tables were created
                var applied = await dbContext.Database.GetAppliedMigrationsAsync(cancellationToken);
                _logger.LogInformation("Total applied migrations: {Count}", applied.Count());
            }
            _logger.LogInformation("Database migration completed successfully!");

            // Step 2: Initialize ABP framework
            _logger.LogInformation("Initializing ABP framework...");
            using var application = await AbpApplicationFactory.CreateAsync<MachineToolsDbMigratorModule>(options =>
            {
                options.Services.ReplaceConfiguration(_configuration);
                options.UseAutofac();
                options.Services.AddLogging(c => c.ClearProviders());
            });

            await application.InitializeAsync();

            // Step 3: Seed data
            _logger.LogInformation("Executing data seed...");
            using (var scope = application.ServiceProvider.CreateScope())
            {
                var dataSeeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();
                await dataSeeder.SeedAsync();
            }
            _logger.LogInformation("Data seed completed successfully!");

            _logger.LogInformation("=== MachineTools DbMigrator Completed Successfully ===");

            await application.ShutdownAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during migration/seeding!");
            throw;
        }

        _hostApplicationLifetime.StopApplication();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private static string MaskConnectionString(string cs)
    {
        var parts = cs.Split(';');
        for (int i = 0; i < parts.Length; i++)
        {
            if (parts[i].TrimStart().StartsWith("Password", StringComparison.OrdinalIgnoreCase))
            {
                parts[i] = "Password=***";
            }
        }
        return string.Join(";", parts);
    }
}
