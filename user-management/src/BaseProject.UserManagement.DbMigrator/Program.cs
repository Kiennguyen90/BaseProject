using BaseProject.UserManagement.DbMigrator;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

// Allow DateTime with PostgreSQL
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Volo.Abp", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/migrations-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("=== UserManagement DbMigrator Started ===");

    var builder = Host.CreateDefaultBuilder(args)
        .UseSerilog()
        .ConfigureServices((context, services) =>
        {
            services.AddHostedService<DbMigratorHostedService>();
        });

    var host = builder.Build();
    await host.RunAsync();

    Log.Information("=== UserManagement DbMigrator Completed ===");
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "UserManagement DbMigrator terminated unexpectedly!");
    return 1;
}
finally
{
    await Log.CloseAndFlushAsync();
}
