using BaseProject.UserManagement.Users.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace BaseProject.UserManagement.Users;

public class ProfileAppService : ApplicationService, IProfileAppService
{
    private readonly IdentityUserManager _userManager;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IIdentityUserRepository _identityUserRepository;
    private readonly UserManager _domainUserManager;

    public ProfileAppService(
        IdentityUserManager userManager,
        IUserProfileRepository profileRepository,
        IIdentityUserRepository identityUserRepository,
        UserManager domainUserManager)
    {
        _userManager = userManager;
        _profileRepository = profileRepository;
        _identityUserRepository = identityUserRepository;
        _domainUserManager = domainUserManager;
    }

    public async Task<UserProfileDto> GetAsync()
    {
        var userId = CurrentUser.GetId();
        var user = await _identityUserRepository.GetAsync(userId);
        var profile = await _domainUserManager.GetOrCreateProfileAsync(userId, user.UserName);
        var roles = await _userManager.GetRolesAsync(user);

        return new UserProfileDto
        {
            Id = profile.Id,
            UserId = user.Id,
            FullName = profile.FullName,
            PhoneNumber = profile.PhoneNumber ?? user.PhoneNumber,
            AvatarUrl = profile.AvatarUrl,
            Department = profile.Department,
            EmployeeCode = profile.EmployeeCode,
            DateOfBirth = profile.DateOfBirth,
            Address = profile.Address,
            Email = user.Email,
            Roles = roles.ToArray()
        };
    }

    public async Task<UserProfileDto> UpdateAsync(UpdateProfileDto input)
    {
        var userId = CurrentUser.GetId();
        var user = await _identityUserRepository.GetAsync(userId);
        var profile = await _domainUserManager.GetOrCreateProfileAsync(userId, user.UserName);

        if (input.FullName != null) profile.FullName = input.FullName;
        if (input.PhoneNumber != null) profile.PhoneNumber = input.PhoneNumber;
        if (input.Department != null) profile.Department = input.Department;
        if (input.EmployeeCode != null) profile.EmployeeCode = input.EmployeeCode;
        if (input.DateOfBirth.HasValue) profile.DateOfBirth = input.DateOfBirth;
        if (input.Address != null) profile.Address = input.Address;

        await _profileRepository.UpdateAsync(profile);

        return await GetAsync();
    }

    public async Task ChangePasswordAsync(ChangePasswordDto input)
    {
        var userId = CurrentUser.GetId();
        var user = await _identityUserRepository.GetAsync(userId);

        var result = await _userManager.ChangePasswordAsync(user, input.CurrentPassword, input.NewPassword);
        if (!result.Succeeded)
        {
            throw new UserFriendlyException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );
        }
    }
}
