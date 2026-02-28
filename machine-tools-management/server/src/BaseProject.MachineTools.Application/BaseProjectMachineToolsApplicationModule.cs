using Volo.Abp.Application;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;

namespace BaseProject.MachineTools;

[DependsOn(
    typeof(BaseProjectMachineToolsDomainModule),
    typeof(BaseProjectMachineToolsApplicationContractsModule),
    typeof(AbpDddApplicationModule),
    typeof(AbpAutoMapperModule)
)]
public class BaseProjectMachineToolsApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<BaseProjectMachineToolsApplicationModule>();
        });
    }
}
