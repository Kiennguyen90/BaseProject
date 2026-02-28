using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Repositories;

public class ReturnRequestRepository : EfCoreRepository<MachineToolsDbContext, ReturnRequest, Guid>, IReturnRequestRepository
{
    public ReturnRequestRepository(IDbContextProvider<MachineToolsDbContext> dbContextProvider)
        : base(dbContextProvider) { }

    public async Task<List<ReturnRequest>> GetListAsync(
        Guid? borrowRequestId = null,
        Guid? employeeId = null,
        ReturnRequestStatus? status = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null,
        bool includeDetails = false)
    {
        var dbContext = await GetDbContextAsync();
        var query = dbContext.ReturnRequests.AsQueryable();

        if (includeDetails)
        {
            query = query.Include(r => r.Device).Include(r => r.Employee).Include(r => r.BorrowRequest);
        }

        return await query
            .WhereIf(borrowRequestId.HasValue, r => r.BorrowRequestId == borrowRequestId!.Value)
            .WhereIf(employeeId.HasValue, r => r.EmployeeId == employeeId!.Value)
            .WhereIf(status.HasValue, r => r.Status == status!.Value)
            .OrderByDescending(r => r.CreationTime)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }

    public async Task<long> GetCountAsync(
        Guid? borrowRequestId = null,
        Guid? employeeId = null,
        ReturnRequestStatus? status = null)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.ReturnRequests
            .WhereIf(borrowRequestId.HasValue, r => r.BorrowRequestId == borrowRequestId!.Value)
            .WhereIf(employeeId.HasValue, r => r.EmployeeId == employeeId!.Value)
            .WhereIf(status.HasValue, r => r.Status == status!.Value)
            .LongCountAsync();
    }

    public async Task<List<ReturnRequest>> GetByEmployeeAsync(Guid employeeId, int skipCount = 0, int maxResultCount = int.MaxValue)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.ReturnRequests
            .Include(r => r.Device)
            .Include(r => r.BorrowRequest)
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.CreationTime)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }
}
