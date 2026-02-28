using System.ComponentModel.DataAnnotations;

namespace BaseProject.UserManagement.Users.Dtos;

public class UpdateProfileDto
{
    [MaxLength(128)]
    public string? FullName { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    public string? Department { get; set; }

    public string? EmployeeCode { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(512)]
    public string? Address { get; set; }
}
