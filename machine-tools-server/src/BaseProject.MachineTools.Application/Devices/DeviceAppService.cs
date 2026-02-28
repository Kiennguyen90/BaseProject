using BaseProject.MachineTools.Devices.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace BaseProject.MachineTools.Devices;

public class DeviceAppService : ApplicationService, IDeviceAppService
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly DeviceManager _deviceManager;
    private readonly IRepository<DeviceCategory, Guid> _categoryRepository;

    public DeviceAppService(
        IDeviceRepository deviceRepository,
        DeviceManager deviceManager,
        IRepository<DeviceCategory, Guid> categoryRepository)
    {
        _deviceRepository = deviceRepository;
        _deviceManager = deviceManager;
        _categoryRepository = categoryRepository;
    }

    public async Task<DeviceDto> GetAsync(Guid id)
    {
        var device = await _deviceRepository.GetAsync(id);
        var dto = ObjectMapper.Map<Device, DeviceDto>(device);

        var category = await _categoryRepository.GetAsync(device.CategoryId);
        dto.CategoryName = category.Name;

        return dto;
    }

    public async Task<PagedResultDto<DeviceDto>> GetListAsync(DeviceListFilterDto input)
    {
        var totalCount = await _deviceRepository.GetCountAsync(
            input.Filter, input.CategoryId, input.DeviceType, input.Status);

        var devices = await _deviceRepository.GetListAsync(
            input.Filter, input.CategoryId, input.DeviceType, input.Status,
            input.SkipCount, input.MaxResultCount, input.Sorting);

        var dtos = ObjectMapper.Map<List<Device>, List<DeviceDto>>(devices);

        return new PagedResultDto<DeviceDto>(totalCount, dtos);
    }

    public async Task<DeviceDto> CreateAsync(CreateDeviceDto input)
    {
        var device = await _deviceManager.CreateAsync(
            input.CategoryId,
            input.Name,
            input.Code,
            input.DeviceType,
            input.TotalQuantity,
            input.Description
        );

        device.Location = input.Location;
        device.SerialNumber = input.SerialNumber;
        device.ImageUrl = input.ImageUrl;
        device.Notes = input.Notes;

        await _deviceRepository.UpdateAsync(device);

        return ObjectMapper.Map<Device, DeviceDto>(device);
    }

    public async Task<DeviceDto> UpdateAsync(Guid id, UpdateDeviceDto input)
    {
        var device = await _deviceRepository.GetAsync(id);

        device = await _deviceManager.UpdateAsync(device, input.Name, input.Code, input.CategoryId);

        device.Description = input.Description;
        device.Location = input.Location;
        device.SerialNumber = input.SerialNumber;
        device.ImageUrl = input.ImageUrl;
        device.Notes = input.Notes;

        return ObjectMapper.Map<Device, DeviceDto>(device);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _deviceRepository.DeleteAsync(id);
    }

    public async Task<PagedResultDto<DeviceDto>> GetAvailableAsync(DeviceListFilterDto input)
    {
        var devices = await _deviceRepository.GetAvailableDevicesAsync(
            input.Filter, input.CategoryId, input.SkipCount, input.MaxResultCount);

        var dtos = ObjectMapper.Map<List<Device>, List<DeviceDto>>(devices);

        return new PagedResultDto<DeviceDto>(dtos.Count, dtos);
    }

    public async Task<DeviceDto> UpdateQuantityAsync(Guid id, int newQuantity)
    {
        var device = await _deviceRepository.GetAsync(id);
        device.SetQuantity(newQuantity);
        await _deviceRepository.UpdateAsync(device);

        return ObjectMapper.Map<Device, DeviceDto>(device);
    }
}
