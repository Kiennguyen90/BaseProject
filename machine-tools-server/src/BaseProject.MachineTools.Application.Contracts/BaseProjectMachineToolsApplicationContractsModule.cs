using Volo.Abp.Application;
using Volo.Abp.Modularity;

namespace BaseProject.MachineTools;

[DependsOn(
    typeof(BaseProjectMachineToolsDomainSharedModule),
    typeof(AbpDddApplicationContractsModule)
)]
public class BaseProjectMachineToolsApplicationContractsModule : AbpModule
{
}
