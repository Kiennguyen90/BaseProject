using BaseProject.MachineTools.Dashboard.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.MachineTools.Dashboard;

public interface IDashboardAppService : IApplicationService
{
    Task<DashboardDto> GetStatsAsync();
}
