using System.ComponentModel.DataAnnotations;

namespace BaseProject.UserManagement.Users.Dtos;

public class TokenRefreshDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
