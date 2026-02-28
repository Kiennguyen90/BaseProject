using Volo.Abp.Identity;
using Volo.Abp.Modularity;

namespace BaseProject.UserManagement;

[DependsOn(
    typeof(BaseProjectUserManagementDomainSharedModule),
    typeof(AbpIdentityDomainModule)
)]
public class BaseProjectUserManagementDomainModule : AbpModule
{
}
