using BaseProject.UserManagement.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Data;

namespace BaseProject.UserManagement.DbMigrator;

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
        _logger.LogInformation("=== UserManagement DbMigrator Started ===");

        try
        {
            // Step 1: Apply EF Core migrations BEFORE ABP initialization
            // ABP modules (PermissionManagement, SettingManagement) query their tables during init,
            // so tables must exist before ABP bootstraps.
            _logger.LogInformation("Applying database migrations...");
            var connectionString = _configuration.GetConnectionString("Default");

            var optionsBuilder = new DbContextOptionsBuilder<UserManagementDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            await using (var dbContext = new UserManagementDbContext(optionsBuilder.Options))
            {
                await dbContext.Database.MigrateAsync(cancellationToken);
            }
            _logger.LogInformation("Database migrations applied successfully!");

            // Step 2: Initialize ABP framework (all tables now exist)
            _logger.LogInformation("Initializing ABP framework...");
            using var application = await AbpApplicationFactory.CreateAsync<UserManagementDbMigratorModule>(options =>
            {
                options.Services.ReplaceConfiguration(_configuration);
                options.UseAutofac();
                options.Services.AddLogging(c => c.ClearProviders());
            });

            await application.InitializeAsync();

            // Step 3: Run seed data contributors
            _logger.LogInformation("Seeding initial data...");
            using (var scope = application.ServiceProvider.CreateScope())
            {
                var dataSeeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();
                await dataSeeder.SeedAsync();
            }
            _logger.LogInformation("Seed data applied successfully!");

            _logger.LogInformation("=== UserManagement DbMigrator Completed ===");

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
