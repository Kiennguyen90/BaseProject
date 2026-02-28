using Volo.Abp.Application;
using Volo.Abp.Modularity;

namespace BaseProject.UserManagement;

[DependsOn(
    typeof(BaseProjectUserManagementDomainSharedModule),
    typeof(AbpDddApplicationContractsModule)
)]
public class BaseProjectUserManagementApplicationContractsModule : AbpModule
{
}
