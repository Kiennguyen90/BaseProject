using Volo.Abp.Identity;
using Volo.Abp.Modularity;

namespace BaseProject.UserManagement;

[DependsOn(
    typeof(AbpIdentityDomainSharedModule)
)]
public class BaseProjectUserManagementDomainSharedModule : AbpModule
{
}
