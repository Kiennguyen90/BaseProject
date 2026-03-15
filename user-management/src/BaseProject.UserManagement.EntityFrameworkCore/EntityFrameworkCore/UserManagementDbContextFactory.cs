using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BaseProject.UserManagement.EntityFrameworkCore;

/// <summary>
/// Design-time DbContext factory for EF Core migrations.
/// </summary>
public class UserManagementDbContextFactory : IDesignTimeDbContextFactory<UserManagementDbContext>
{
    public UserManagementDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<UserManagementDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=usermanagement;Username=admin;Password=admin");

        return new UserManagementDbContext(builder.Options);
    }
}
