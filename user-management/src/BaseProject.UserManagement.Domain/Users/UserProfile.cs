using Volo.Abp.Domain.Entities.Auditing;

namespace BaseProject.UserManagement.Users;

/// <summary>
/// Extended user profile linked to ABP IdentityUser.
/// </summary>
public class UserProfile : FullAuditedAggregateRoot<Guid>
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Department { get; set; }
    public string? EmployeeCode { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }

    protected UserProfile() { }

    public UserProfile(Guid id, Guid userId, string fullName) : base(id)
    {
        UserId = userId;
        FullName = fullName;
    }
}
