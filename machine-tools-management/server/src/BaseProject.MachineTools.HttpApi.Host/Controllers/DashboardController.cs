using BaseProject.MachineTools.Dashboard;
using BaseProject.MachineTools.Dashboard.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseProject.MachineTools.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardAppService _dashboardAppService;

    public DashboardController(IDashboardAppService dashboardAppService)
    {
        _dashboardAppService = dashboardAppService;
    }

    [HttpGet("stats")]
    public async Task<DashboardDto> GetStats()
    {
        return await _dashboardAppService.GetStatsAsync();
    }
}
