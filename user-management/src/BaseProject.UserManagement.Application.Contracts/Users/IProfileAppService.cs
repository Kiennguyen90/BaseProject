using BaseProject.UserManagement.Users.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.UserManagement.Users;

public interface IProfileAppService : IApplicationService
{
    Task<UserProfileDto> GetAsync();
    Task<UserProfileDto> UpdateAsync(UpdateProfileDto input);
    Task ChangePasswordAsync(ChangePasswordDto input);
}
