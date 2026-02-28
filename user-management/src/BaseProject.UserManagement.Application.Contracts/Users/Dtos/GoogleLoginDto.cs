using System.ComponentModel.DataAnnotations;

namespace BaseProject.UserManagement.Users.Dtos;

public class GoogleLoginDto
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
