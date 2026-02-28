namespace BaseProject.UserManagement.Users.Dtos;

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Department { get; set; }
    public string? EmployeeCode { get; set; }
    public bool IsActive { get; set; }
    public string[] Roles { get; set; } = [];
    public DateTime CreationTime { get; set; }
}
