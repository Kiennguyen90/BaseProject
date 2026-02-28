using Volo.Abp.Domain.Repositories;

namespace BaseProject.MachineTools.Devices;

public interface IDeviceRepository : IRepository<Device, Guid>
{
    Task<Device?> FindByCodeAsync(string code);
    Task<List<Device>> GetListAsync(
        string? filter = null,
        Guid? categoryId = null,
        Enums.DeviceType? deviceType = null,
        Enums.DeviceStatus? status = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null);
    Task<long> GetCountAsync(
        string? filter = null,
        Guid? categoryId = null,
        Enums.DeviceType? deviceType = null,
        Enums.DeviceStatus? status = null);
    Task<List<Device>> GetAvailableDevicesAsync(
        string? filter = null,
        Guid? categoryId = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue);
}
