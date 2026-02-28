using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Repositories;

public class BorrowRequestRepository : EfCoreRepository<MachineToolsDbContext, BorrowRequest, Guid>, IBorrowRequestRepository
{
    public BorrowRequestRepository(IDbContextProvider<MachineToolsDbContext> dbContextProvider)
        : base(dbContextProvider) { }

    public async Task<List<BorrowRequest>> GetListAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        BorrowRequestStatus? status = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue,
        string? sorting = null,
        bool includeDetails = false)
    {
        var dbContext = await GetDbContextAsync();
        var query = dbContext.BorrowRequests.AsQueryable();

        if (includeDetails)
        {
            query = query.Include(r => r.Device).Include(r => r.Employee);
        }

        return await query
            .WhereIf(deviceId.HasValue, r => r.DeviceId == deviceId!.Value)
            .WhereIf(employeeId.HasValue, r => r.EmployeeId == employeeId!.Value)
            .WhereIf(status.HasValue, r => r.Status == status!.Value)
            .OrderByDescending(r => r.CreationTime)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }

    public async Task<long> GetCountAsync(
        Guid? deviceId = null,
        Guid? employeeId = null,
        BorrowRequestStatus? status = null)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.BorrowRequests
            .WhereIf(deviceId.HasValue, r => r.DeviceId == deviceId!.Value)
            .WhereIf(employeeId.HasValue, r => r.EmployeeId == employeeId!.Value)
            .WhereIf(status.HasValue, r => r.Status == status!.Value)
            .LongCountAsync();
    }

    public async Task<List<BorrowRequest>> GetOverdueRequestsAsync()
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.BorrowRequests
            .Include(r => r.Device)
            .Include(r => r.Employee)
            .Where(r => r.Status == BorrowRequestStatus.Approved && r.ExpectedReturnDate < DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task<List<BorrowRequest>> GetByEmployeeAsync(Guid employeeId, int skipCount = 0, int maxResultCount = int.MaxValue)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.BorrowRequests
            .Include(r => r.Device)
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.CreationTime)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }
}
