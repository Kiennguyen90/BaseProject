using BaseProject.MachineTools.Devices.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.MachineTools.Devices;

public interface IDeviceCategoryAppService : IApplicationService
{
    Task<DeviceCategoryDto> GetAsync(Guid id);
    Task<ListResultDto<DeviceCategoryDto>> GetListAsync();
    Task<DeviceCategoryDto> CreateAsync(CreateDeviceCategoryDto input);
    Task<DeviceCategoryDto> UpdateAsync(Guid id, UpdateDeviceCategoryDto input);
    Task DeleteAsync(Guid id);
}
