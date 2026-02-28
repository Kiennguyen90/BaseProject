using Serilog;

namespace BaseProject.UserManagement;

public class Program
{
    public static async Task Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()
            .CreateBootstrapLogger();

        try
        {
            Log.Information("Starting BaseProject.UserManagement.HttpApi.Host...");

            var builder = WebApplication.CreateBuilder(args);

            builder.Host.UseSerilog((context, loggerConfiguration) =>
            {
                loggerConfiguration
                    .ReadFrom.Configuration(context.Configuration)
                    .Enrich.FromLogContext();
            });

            builder.Host.UseAutofac();
            await builder.AddApplicationAsync<BaseProjectUserManagementHttpApiHostModule>();

            var app = builder.Build();
            await app.InitializeApplicationAsync();
            await app.RunAsync();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Host terminated unexpectedly!");
            throw;
        }
        finally
        {
            await Log.CloseAndFlushAsync();
        }
    }
}
