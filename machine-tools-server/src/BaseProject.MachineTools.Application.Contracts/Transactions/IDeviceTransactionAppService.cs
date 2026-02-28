using BaseProject.MachineTools.Transactions.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.MachineTools.Transactions;

public interface IDeviceTransactionAppService : IApplicationService
{
    Task<PagedResultDto<DeviceTransactionDto>> GetListAsync(TransactionFilterDto input);
    Task<PagedResultDto<DeviceTransactionDto>> GetByDeviceAsync(Guid deviceId, PagedAndSortedResultRequestDto input);
    Task<PagedResultDto<DeviceTransactionDto>> GetByEmployeeAsync(Guid employeeId, PagedAndSortedResultRequestDto input);
    Task<PagedResultDto<DeviceTransactionDto>> GetMyListAsync(PagedAndSortedResultRequestDto input);
}
