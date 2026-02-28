using System.ComponentModel.DataAnnotations;

namespace BaseProject.UserManagement.Users.Dtos;

public class CreateUserDto
{
    [Required]
    [MaxLength(128)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    public string? Department { get; set; }
    
    public string? EmployeeCode { get; set; }

    public string[] RoleNames { get; set; } = [];
}
