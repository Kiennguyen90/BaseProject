using BaseProject.UserManagement.Users.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.UserManagement.Users;

public interface IAuthAppService : IApplicationService
{
    Task<LoginResultDto> LoginWithPhoneAsync(LoginWithPhoneDto input);
    Task<LoginResultDto> LoginWithGoogleAsync(GoogleLoginDto input);
    Task<LoginResultDto> RegisterAsync(RegisterDto input);
    Task<LoginResultDto> RefreshTokenAsync(TokenRefreshDto input);
}
