using Volo.Abp.Domain.Repositories;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Transactions;

public interface IDeviceTransactionRepository : IRepository<DeviceTransaction, Guid>
{
    Task<List<DeviceTransaction>> GetListAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        TransactionType? transactionType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null);

    Task<long> GetCountAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        TransactionType? transactionType = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);

    Task<List<DeviceTransaction>> GetByDeviceAsync(Guid deviceId, int skipCount = 0, int maxResultCount = int.MaxValue);
    Task<List<DeviceTransaction>> GetByEmployeeAsync(Guid employeeId, int skipCount = 0, int maxResultCount = int.MaxValue);
}
