using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Devices.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Controllers;

[ApiController]
[Route("api/device-categories")]
[Authorize]
public class DeviceCategoryController : ControllerBase
{
    private readonly IDeviceCategoryAppService _categoryAppService;

    public DeviceCategoryController(IDeviceCategoryAppService categoryAppService)
    {
        _categoryAppService = categoryAppService;
    }

    [HttpGet]
    public async Task<ListResultDto<DeviceCategoryDto>> GetList()
    {
        return await _categoryAppService.GetListAsync();
    }

    [HttpGet("{id}")]
    public async Task<DeviceCategoryDto> Get(Guid id)
    {
        return await _categoryAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<DeviceCategoryDto> Create([FromBody] CreateDeviceCategoryDto input)
    {
        return await _categoryAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<DeviceCategoryDto> Update(Guid id, [FromBody] UpdateDeviceCategoryDto input)
    {
        return await _categoryAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task Delete(Guid id)
    {
        await _categoryAppService.DeleteAsync(id);
    }
}
