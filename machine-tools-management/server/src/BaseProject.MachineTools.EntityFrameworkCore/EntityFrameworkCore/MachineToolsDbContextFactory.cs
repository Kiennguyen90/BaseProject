using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BaseProject.MachineTools;

public class MachineToolsDbContextFactory : IDesignTimeDbContextFactory<MachineToolsDbContext>
{
    public MachineToolsDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<MachineToolsDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=machinetools;Username=admin;Password=admin");

        return new MachineToolsDbContext(builder.Options);
    }
}
