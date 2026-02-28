using Volo.Abp;
using Volo.Abp.Domain.Services;

namespace BaseProject.MachineTools.Devices;

public class DeviceManager : DomainService
{
    private readonly IDeviceRepository _deviceRepository;

    public DeviceManager(IDeviceRepository deviceRepository)
    {
        _deviceRepository = deviceRepository;
    }

    public async Task<Device> CreateAsync(
        Guid categoryId,
        string name,
        string code,
        Enums.DeviceType deviceType,
        int totalQuantity,
        string? description = null)
    {
        var existing = await _deviceRepository.FindByCodeAsync(code);
        if (existing != null)
        {
            throw new UserFriendlyException($"Device with code '{code}' already exists.");
        }

        var device = new Device(
            GuidGenerator.Create(),
            categoryId,
            name,
            code,
            deviceType,
            totalQuantity,
            description
        );

        return await _deviceRepository.InsertAsync(device);
    }

    public async Task<Device> UpdateAsync(
        Device device,
        string name,
        string code,
        Guid categoryId)
    {
        if (device.Code != code)
        {
            var existing = await _deviceRepository.FindByCodeAsync(code);
            if (existing != null && existing.Id != device.Id)
            {
                throw new UserFriendlyException($"Device with code '{code}' already exists.");
            }
        }

        device.SetName(name);
        device.SetCode(code);
        device.SetCategory(categoryId);

        return await _deviceRepository.UpdateAsync(device);
    }
}
