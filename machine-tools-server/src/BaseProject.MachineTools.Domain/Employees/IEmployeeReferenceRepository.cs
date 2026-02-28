using Volo.Abp.Domain.Repositories;

namespace BaseProject.MachineTools.Employees;

public interface IEmployeeReferenceRepository : IRepository<EmployeeReference, Guid>
{
    Task<EmployeeReference?> FindByUserIdAsync(Guid userId);
    Task<List<EmployeeReference>> GetListAsync(
        string? filter = null,
        bool? isActive = null,
        int skipCount = 0,
        int maxResultCount = int.MaxValue);
}
