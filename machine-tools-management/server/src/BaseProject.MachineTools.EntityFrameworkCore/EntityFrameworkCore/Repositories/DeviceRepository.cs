using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Repositories;

public class DeviceRepository : EfCoreRepository<MachineToolsDbContext, Device, Guid>, IDeviceRepository
{
    public DeviceRepository(IDbContextProvider<MachineToolsDbContext> dbContextProvider)
        : base(dbContextProvider) { }

    public async Task<Device?> FindByCodeAsync(string code)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.Devices.FirstOrDefaultAsync(d => d.Code == code);
    }

    public async Task<List<Device>> GetListAsync(
        string? filter = null,
        Guid? categoryId = null,
        DeviceType? deviceType = null,
        DeviceStatus? status = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.Devices
            .Include(d => d.Category)
            .WhereIf(!string.IsNullOrWhiteSpace(filter),
                d => d.Name.Contains(filter!) || d.Code.Contains(filter!))
            .WhereIf(categoryId.HasValue, d => d.CategoryId == categoryId!.Value)
            .WhereIf(deviceType.HasValue, d => d.DeviceType == deviceType!.Value)
            .WhereIf(status.HasValue, d => d.Status == status!.Value)
            .OrderByDescending(d => d.CreationTime)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }

    public async Task<long> GetCountAsync(
        string? filter = null,
        Guid? categoryId = null,
        DeviceType? deviceType = null,
        DeviceStatus? status = null)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.Devices
            .WhereIf(!string.IsNullOrWhiteSpace(filter),
                d => d.Name.Contains(filter!) || d.Code.Contains(filter!))
            .WhereIf(categoryId.HasValue, d => d.CategoryId == categoryId!.Value)
            .WhereIf(deviceType.HasValue, d => d.DeviceType == deviceType!.Value)
            .WhereIf(status.HasValue, d => d.Status == status!.Value)
            .LongCountAsync();
    }

    public async Task<List<Device>> GetAvailableDevicesAsync(
        string? filter = null,
        Guid? categoryId = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.Devices
            .Include(d => d.Category)
            .Where(d => d.AvailableQuantity > 0 && d.Status == DeviceStatus.Available)
            .WhereIf(!string.IsNullOrWhiteSpace(filter),
                d => d.Name.Contains(filter!) || d.Code.Contains(filter!))
            .WhereIf(categoryId.HasValue, d => d.CategoryId == categoryId!.Value)
            .OrderBy(d => d.Name)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }
}
