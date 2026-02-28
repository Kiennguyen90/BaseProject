using BaseProject.UserManagement.Users.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;

namespace BaseProject.UserManagement.Users;

public class UserAppService : ApplicationService, IUserAppService
{
    private readonly IdentityUserManager _userManager;
    private readonly IIdentityUserRepository _identityUserRepository;
    private readonly UserManager _domainUserManager;
    private readonly IUserProfileRepository _profileRepository;

    public UserAppService(
        IdentityUserManager userManager,
        IIdentityUserRepository identityUserRepository,
        UserManager domainUserManager,
        IUserProfileRepository profileRepository)
    {
        _userManager = userManager;
        _identityUserRepository = identityUserRepository;
        _domainUserManager = domainUserManager;
        _profileRepository = profileRepository;
    }

    public async Task<PagedResultDto<UserDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _identityUserRepository.GetCountAsync();
        var users = await _identityUserRepository.GetListAsync(
            sorting: input.Sorting ?? "CreationTime DESC",
            maxResultCount: input.MaxResultCount,
            skipCount: input.SkipCount
        );

        var items = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var profile = await _profileRepository.FindByUserIdAsync(user.Id);

            items.Add(new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                FullName = profile?.FullName ?? user.UserName,
                AvatarUrl = profile?.AvatarUrl,
                Department = profile?.Department,
                EmployeeCode = profile?.EmployeeCode,
                IsActive = user.IsActive,
                Roles = roles.ToArray(),
                CreationTime = user.CreationTime
            });
        }

        return new PagedResultDto<UserDto>(totalCount, items);
    }

    public async Task<UserDto> GetAsync(Guid id)
    {
        var user = await _identityUserRepository.GetAsync(id);
        var roles = await _userManager.GetRolesAsync(user);
        var profile = await _profileRepository.FindByUserIdAsync(user.Id);

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            FullName = profile?.FullName ?? user.UserName,
            AvatarUrl = profile?.AvatarUrl,
            Department = profile?.Department,
            EmployeeCode = profile?.EmployeeCode,
            IsActive = user.IsActive,
            Roles = roles.ToArray(),
            CreationTime = user.CreationTime
        };
    }

    public async Task<UserDto> CreateAsync(CreateUserDto input)
    {
        var user = await _domainUserManager.CreateUserWithProfileAsync(
            userName: input.UserName,
            password: input.Password,
            fullName: input.FullName,
            email: input.Email,
            phoneNumber: input.PhoneNumber,
            roleName: input.RoleNames.FirstOrDefault()
        );

        // Add remaining roles
        foreach (var role in input.RoleNames.Skip(1))
        {
            await _userManager.AddToRoleAsync(user, role);
        }

        // Update profile with additional info
        var profile = await _profileRepository.FindByUserIdAsync(user.Id);
        if (profile != null)
        {
            profile.Department = input.Department;
            profile.EmployeeCode = input.EmployeeCode;
            await _profileRepository.UpdateAsync(profile);
        }

        return await GetAsync(user.Id);
    }

    public async Task<UserDto> UpdateAsync(Guid id, CreateUserDto input)
    {
        var user = await _identityUserRepository.GetAsync(id);

        if (!string.IsNullOrWhiteSpace(input.Email))
        {
            await _userManager.SetEmailAsync(user, input.Email);
        }

        if (!string.IsNullOrWhiteSpace(input.PhoneNumber))
        {
            user.SetPhoneNumber(input.PhoneNumber, false);
        }

        await _identityUserRepository.UpdateAsync(user);

        var profile = await _domainUserManager.GetOrCreateProfileAsync(user.Id, input.FullName);
        profile.FullName = input.FullName;
        profile.Department = input.Department;
        profile.EmployeeCode = input.EmployeeCode;
        profile.PhoneNumber = input.PhoneNumber;
        await _profileRepository.UpdateAsync(profile);

        // Update roles
        var currentRoles = await _userManager.GetRolesAsync(user);
        foreach (var role in currentRoles)
        {
            await _userManager.RemoveFromRoleAsync(user, role);
        }
        foreach (var role in input.RoleNames)
        {
            await _userManager.AddToRoleAsync(user, role);
        }

        return await GetAsync(id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await _identityUserRepository.GetAsync(id);
        user.SetIsActive(false);
        await _identityUserRepository.UpdateAsync(user);
    }

    public async Task<string[]> GetRolesAsync(Guid id)
    {
        var user = await _identityUserRepository.GetAsync(id);
        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToArray();
    }

    public async Task SetRolesAsync(Guid id, string[] roleNames)
    {
        var user = await _identityUserRepository.GetAsync(id);
        var currentRoles = await _userManager.GetRolesAsync(user);

        foreach (var role in currentRoles)
        {
            await _userManager.RemoveFromRoleAsync(user, role);
        }

        foreach (var role in roleNames)
        {
            await _userManager.AddToRoleAsync(user, role);
        }
    }
}
