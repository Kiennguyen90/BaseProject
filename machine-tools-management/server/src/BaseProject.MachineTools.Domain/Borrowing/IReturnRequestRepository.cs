using Volo.Abp.Domain.Repositories;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Borrowing;

public interface IReturnRequestRepository : IRepository<ReturnRequest, Guid>
{
    Task<List<ReturnRequest>> GetListAsync(
        Guid? borrowRequestId = null,
        Guid? employeeId = null,
        ReturnRequestStatus? status = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null,
        bool includeDetails = false);

    Task<long> GetCountAsync(
        Guid? borrowRequestId = null,
        Guid? employeeId = null,
        ReturnRequestStatus? status = null);

    Task<List<ReturnRequest>> GetByEmployeeAsync(Guid employeeId, int skipCount = 0, int maxResultCount = int.MaxValue);
}
