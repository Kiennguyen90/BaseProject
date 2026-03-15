using BaseProject.UserManagement.EntityFrameworkCore.Repositories;
using BaseProject.UserManagement.Users;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.PostgreSql;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;

namespace BaseProject.UserManagement.EntityFrameworkCore;

[DependsOn(
    typeof(BaseProjectUserManagementDomainModule),
    typeof(AbpIdentityEntityFrameworkCoreModule),
    typeof(AbpPermissionManagementEntityFrameworkCoreModule),
    typeof(AbpSettingManagementEntityFrameworkCoreModule),
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
            options.ReplaceDbContext<IIdentityDbContext>();
            options.ReplaceDbContext<IPermissionManagementDbContext>();
            options.ReplaceDbContext<ISettingManagementDbContext>();
        });

        // Register custom repositories
        context.Services.AddTransient<IUserProfileRepository, UserProfileRepository>();

        Configure<AbpDbContextOptions>(options =>
        {
            options.UseNpgsql();
        });
    }
}
