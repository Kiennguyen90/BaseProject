using Volo.Abp.AutoMapper;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;

namespace BaseProject.UserManagement;

[DependsOn(
    typeof(BaseProjectUserManagementDomainModule),
    typeof(BaseProjectUserManagementApplicationContractsModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpAutoMapperModule)
)]
public class BaseProjectUserManagementApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<BaseProjectUserManagementApplicationModule>();
        });
    }
}
