using Serilog;
using Serilog.Events;

namespace BaseProject.MachineTools;

public class Program
{
    public static async Task<int> Main(string[] args)
    {
        // Allow DateTime with PostgreSQL
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .WriteTo.Async(c => c.Console())
            .WriteTo.Async(c => c.File("Logs/logs.txt", rollingInterval: RollingInterval.Day))
            .CreateLogger();

        try
        {
            Log.Information("Starting BaseProject.MachineTools.HttpApi.Host");
            var builder = WebApplication.CreateBuilder(args);
            builder.Host.UseSerilog();
            builder.Host.UseAutofac();
            await builder.AddApplicationAsync<BaseProjectMachineToolsHttpApiHostModule>();
            var app = builder.Build();
            await app.InitializeApplicationAsync();
            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            if (ex is HostAbortedException) throw;
            Log.Fatal(ex, "Host terminated unexpectedly!");
            return 1;
        }
        finally
        {
            await Log.CloseAndFlushAsync();
        }
    }
}
