using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BaseProject.MachineTools;

public class MachineToolsDbContextFactory : IDesignTimeDbContextFactory<MachineToolsDbContext>
{
    public MachineToolsDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<MachineToolsDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=BaseProject_MachineTools;Username=postgres;Password=postgres");

        return new MachineToolsDbContext(builder.Options);
    }
}
