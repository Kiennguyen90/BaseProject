using BaseProject.MachineTools.Transactions;
using BaseProject.MachineTools.Transactions.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class DeviceTransactionController : ControllerBase
{
    private readonly IDeviceTransactionAppService _transactionAppService;

    public DeviceTransactionController(IDeviceTransactionAppService transactionAppService)
    {
        _transactionAppService = transactionAppService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<DeviceTransactionDto>> GetList([FromQuery] TransactionFilterDto input)
    {
        return await _transactionAppService.GetListAsync(input);
    }

    [HttpGet("device/{deviceId}")]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<DeviceTransactionDto>> GetByDevice(Guid deviceId, [FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _transactionAppService.GetByDeviceAsync(deviceId, input);
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<DeviceTransactionDto>> GetByEmployee(Guid employeeId, [FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _transactionAppService.GetByEmployeeAsync(employeeId, input);
    }

    [HttpGet("my")]
    public async Task<PagedResultDto<DeviceTransactionDto>> GetMyList([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _transactionAppService.GetMyListAsync(input);
    }
}
