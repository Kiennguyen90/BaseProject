using BaseProject.MachineTools.Devices.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.MachineTools.Devices;

public interface IDeviceAppService : IApplicationService
{
    Task<DeviceDto> GetAsync(Guid id);
    Task<PagedResultDto<DeviceDto>> GetListAsync(DeviceListFilterDto input);
    Task<DeviceDto> CreateAsync(CreateDeviceDto input);
    Task<DeviceDto> UpdateAsync(Guid id, UpdateDeviceDto input);
    Task DeleteAsync(Guid id);
    Task<PagedResultDto<DeviceDto>> GetAvailableAsync(DeviceListFilterDto input);
    Task<DeviceDto> UpdateQuantityAsync(Guid id, int newQuantity);
}
