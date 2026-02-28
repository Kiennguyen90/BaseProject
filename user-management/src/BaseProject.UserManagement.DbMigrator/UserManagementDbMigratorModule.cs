using BaseProject.UserManagement.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace BaseProject.UserManagement.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(BaseProjectUserManagementEntityFrameworkCoreModule),
    typeof(BaseProjectUserManagementApplicationModule)
)]
public class UserManagementDbMigratorModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
    }
}
