using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Devices.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Controllers;

[ApiController]
[Route("api/devices")]
[Authorize]
public class DeviceController : ControllerBase
{
    private readonly IDeviceAppService _deviceAppService;

    public DeviceController(IDeviceAppService deviceAppService)
    {
        _deviceAppService = deviceAppService;
    }

    [HttpGet]
    public async Task<PagedResultDto<DeviceDto>> GetList([FromQuery] DeviceListFilterDto input)
    {
        return await _deviceAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public async Task<DeviceDto> Get(Guid id)
    {
        return await _deviceAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<DeviceDto> Create([FromBody] CreateDeviceDto input)
    {
        return await _deviceAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<DeviceDto> Update(Guid id, [FromBody] UpdateDeviceDto input)
    {
        return await _deviceAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task Delete(Guid id)
    {
        await _deviceAppService.DeleteAsync(id);
    }

    [HttpGet("available")]
    public async Task<PagedResultDto<DeviceDto>> GetAvailable([FromQuery] DeviceListFilterDto input)
    {
        return await _deviceAppService.GetAvailableAsync(input);
    }

    [HttpPut("{id}/quantity")]
    [Authorize(Roles = "Admin")]
    public async Task<DeviceDto> UpdateQuantity(Guid id, [FromBody] int newQuantity)
    {
        return await _deviceAppService.UpdateQuantityAsync(id, newQuantity);
    }
}
