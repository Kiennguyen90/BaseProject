using BaseProject.UserManagement.Users.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace BaseProject.UserManagement.Users;

public interface IUserAppService : IApplicationService
{
    Task<PagedResultDto<UserDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    Task<UserDto> GetAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto input);
    Task<UserDto> UpdateAsync(Guid id, CreateUserDto input);
    Task DeleteAsync(Guid id);
    Task<string[]> GetRolesAsync(Guid id);
    Task SetRolesAsync(Guid id, string[] roleNames);
}
