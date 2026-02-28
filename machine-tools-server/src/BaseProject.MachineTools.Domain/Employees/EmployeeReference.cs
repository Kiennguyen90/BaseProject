using Volo.Abp.Domain.Entities.Auditing;

namespace BaseProject.MachineTools.Employees;

public class EmployeeReference : CreationAuditedAggregateRoot<Guid>
{
    public Guid UserId { get; private set; }
    public string FullName { get; private set; } = null!;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmployeeCode { get; set; }
    public string? Department { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime LastSyncTime { get; private set; }

    protected EmployeeReference() { }

    public EmployeeReference(
        Guid id,
        Guid userId,
        string fullName,
        string? email = null,
        string? phoneNumber = null,
        string? employeeCode = null,
        string? department = null)
        : base(id)
    {
        UserId = userId;
        FullName = fullName;
        Email = email;
        PhoneNumber = phoneNumber;
        EmployeeCode = employeeCode;
        Department = department;
        LastSyncTime = DateTime.UtcNow;
    }

    public void SyncFromClaims(string fullName, string? email, string? phoneNumber, string? employeeCode)
    {
        FullName = fullName;
        Email = email;
        PhoneNumber = phoneNumber;
        EmployeeCode = employeeCode;
        LastSyncTime = DateTime.UtcNow;
    }
}
