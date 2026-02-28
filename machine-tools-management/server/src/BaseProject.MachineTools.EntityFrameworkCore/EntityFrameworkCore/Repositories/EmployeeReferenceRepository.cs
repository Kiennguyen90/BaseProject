using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using BaseProject.MachineTools.Employees;

namespace BaseProject.MachineTools.Repositories;

public class EmployeeReferenceRepository : EfCoreRepository<MachineToolsDbContext, EmployeeReference, Guid>, IEmployeeReferenceRepository
{
    public EmployeeReferenceRepository(IDbContextProvider<MachineToolsDbContext> dbContextProvider)
        : base(dbContextProvider) { }

    public async Task<EmployeeReference?> FindByUserIdAsync(Guid userId)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.EmployeeReferences.FirstOrDefaultAsync(e => e.UserId == userId);
    }

    public async Task<List<EmployeeReference>> GetListAsync(
        string? filter = null,
        bool? isActive = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.EmployeeReferences
            .WhereIf(!string.IsNullOrWhiteSpace(filter),
                e => e.FullName.Contains(filter!) || (e.EmployeeCode != null && e.EmployeeCode.Contains(filter!)))
            .WhereIf(isActive.HasValue, e => e.IsActive == isActive!.Value)
            .OrderBy(e => e.FullName)
            .PageBy(skipCount, maxResultCount)
            .ToListAsync();
    }
}
