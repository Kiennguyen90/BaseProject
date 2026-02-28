using BaseProject.UserManagement.EntityFrameworkCore.Repositories;
using BaseProject.UserManagement.Users;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.PostgreSql;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace BaseProject.UserManagement.EntityFrameworkCore;

[DependsOn(
    typeof(BaseProjectUserManagementDomainModule),
    typeof(AbpIdentityEntityFrameworkCoreModule),
    typeof(AbpEntityFrameworkCorePostgreSqlModule)
)]
public class BaseProjectUserManagementEntityFrameworkCoreModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // Allow DateTime with PostgreSQL
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        context.Services.AddAbpDbContext<UserManagementDbContext>(options =>
        {
            options.AddDefaultRepositories(includeAllEntities: true);
        });

        // Register custom repositories
        context.Services.AddTransient<IUserProfileRepository, UserProfileRepository>();

        Configure<AbpDbContextOptions>(options =>
        {
            options.UseNpgsql();
        });
    }
}
