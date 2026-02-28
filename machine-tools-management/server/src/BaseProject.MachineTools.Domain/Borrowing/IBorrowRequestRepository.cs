using Volo.Abp.Domain.Repositories;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Borrowing;

public interface IBorrowRequestRepository : IRepository<BorrowRequest, Guid>
{
    Task<List<BorrowRequest>> GetListAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        BorrowRequestStatus? status = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null,
        bool includeDetails = false);

    Task<long> GetCountAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        BorrowRequestStatus? status = null);

    Task<List<BorrowRequest>> GetOverdueRequestsAsync();

    Task<List<BorrowRequest>> GetByEmployeeAsync(Guid employeeId, int skipCount = 0, int maxResultCount = int.MaxValue);
}
