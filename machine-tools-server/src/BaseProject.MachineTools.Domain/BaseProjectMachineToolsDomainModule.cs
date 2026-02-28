using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace BaseProject.MachineTools;

[DependsOn(
    typeof(BaseProjectMachineToolsDomainSharedModule),
    typeof(AbpDddDomainModule)
)]
public class BaseProjectMachineToolsDomainModule : AbpModule
{
}
