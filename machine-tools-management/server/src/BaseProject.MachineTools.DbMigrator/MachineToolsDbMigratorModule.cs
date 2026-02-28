using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace BaseProject.MachineTools.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(BaseProjectMachineToolsEntityFrameworkCoreModule),
    typeof(BaseProjectMachineToolsApplicationModule)
)]
public class MachineToolsDbMigratorModule : AbpModule
{
}
