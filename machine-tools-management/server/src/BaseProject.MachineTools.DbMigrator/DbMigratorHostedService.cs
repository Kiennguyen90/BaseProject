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

        try
        {
            // Step 1: Apply EF Core migrations BEFORE ABP initialization
            _logger.LogInformation("Applying database migrations...");
            var connectionString = _configuration.GetConnectionString("Default");

            var optionsBuilder = new DbContextOptionsBuilder<MachineToolsDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            await using (var dbContext = new MachineToolsDbContext(optionsBuilder.Options))
            {
                await dbContext.Database.MigrateAsync(cancellationToken);
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

            _logger.LogInformation("=== MachineTools DbMigrator Completed ===");

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
}
