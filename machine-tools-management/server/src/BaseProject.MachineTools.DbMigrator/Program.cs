using BaseProject.MachineTools.DbMigrator;
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
    var builder = Host.CreateDefaultBuilder(args);
    builder.UseSerilog();
    builder.ConfigureServices((context, services) =>
    {
        services.AddHostedService<DbMigratorHostedService>();
    });

    var host = builder.Build();
    await host.RunAsync();
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "MachineTools DbMigrator terminated unexpectedly!");
    return 1;
}
finally
{
    await Log.CloseAndFlushAsync();
}
