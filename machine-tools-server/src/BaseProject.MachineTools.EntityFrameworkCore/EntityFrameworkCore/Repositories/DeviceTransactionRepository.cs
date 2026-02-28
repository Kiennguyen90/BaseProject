using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using BaseProject.MachineTools.Transactions;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Repositories;

public class DeviceTransactionRepository : EfCoreRepository<MachineToolsDbContext, DeviceTransaction, Guid>, IDeviceTransactionRepository
{
    public DeviceTransactionRepository(IDbContextProvider<MachineToolsDbContext> dbContextProvider)
        : base(dbContextProvider) { }

    public async Task<List<DeviceTransaction>> GetListAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        TransactionType? transactionType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.DeviceTransactions
            .WhereIf(deviceId.HasValue, t => t.DeviceId == deviceId!.Value)
            .WhereIf(employeeId.HasValue, t => t.EmployeeId == employeeId!.Value)
            .WhereIf(transactionType.HasValue, t => t.TransactionType == transactionType!.Value)
            .WhereIf(fromDate.HasValue, t => t.TransactionDate >= fromDate!.Value)
            .WhereIf(toDate.HasValue, t => t.TransactionDate <= toDate!.Value)
            .OrderByDescending(t => t.TransactionDate)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }

    public async Task<long> GetCountAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        TransactionType? transactionType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.DeviceTransactions
            .WhereIf(deviceId.HasValue, t => t.DeviceId == deviceId!.Value)
            .WhereIf(employeeId.HasValue, t => t.EmployeeId == employeeId!.Value)
            .WhereIf(transactionType.HasValue, t => t.TransactionType == transactionType!.Value)
            .WhereIf(fromDate.HasValue, t => t.TransactionDate >= fromDate!.Value)
            .WhereIf(toDate.HasValue, t => t.TransactionDate <= toDate!.Value)
            .LongCountAsync();
    }

    public async Task<List<DeviceTransaction>> GetByDeviceAsync(Guid deviceId, int skipCount = 0, int maxResultCount = int.MaxValue)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.DeviceTransactions
            .Where(t => t.DeviceId == deviceId)
            .OrderByDescending(t => t.TransactionDate)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }

    public async Task<List<DeviceTransaction>> GetByEmployeeAsync(Guid employeeId, int skipCount = 0, int maxResultCount = int.MaxValue)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.DeviceTransactions
            .Where(t => t.EmployeeId == employeeId)
            .OrderByDescending(t => t.TransactionDate)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }
}
