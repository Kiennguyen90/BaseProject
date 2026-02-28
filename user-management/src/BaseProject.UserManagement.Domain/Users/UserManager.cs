using Microsoft.AspNetCore.Identity;
using Volo.Abp;
using Volo.Abp.Domain.Services;
using Volo.Abp.Identity;

namespace BaseProject.UserManagement.Users;

/// <summary>
/// Domain service for user management operations.
/// </summary>
public class UserManager : DomainService
{
    private readonly IdentityUserManager _identityUserManager;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IIdentityRoleRepository _roleRepository;

    public UserManager(
        IdentityUserManager identityUserManager,
        IUserProfileRepository profileRepository,
        IIdentityRoleRepository roleRepository)
    {
        _identityUserManager = identityUserManager;
        _profileRepository = profileRepository;
        _roleRepository = roleRepository;
    }

    public async Task<IdentityUser> CreateUserWithProfileAsync(
        string userName,
        string password,
        string fullName,
        string? email = null,
        string? phoneNumber = null,
        string? roleName = null)
    {
        var user = new IdentityUser(
            GuidGenerator.Create(),
            userName,
            email ?? $"{userName}@placeholder.com"
        );

        if (!string.IsNullOrWhiteSpace(phoneNumber))
        {
            user.SetPhoneNumber(phoneNumber, false);
        }

        var result = await _identityUserManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new UserFriendlyException(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );
        }

        if (!string.IsNullOrWhiteSpace(roleName))
        {
            await _identityUserManager.AddToRoleAsync(user, roleName);
        }

        var profile = new UserProfile(
            GuidGenerator.Create(),
            user.Id,
            fullName
        )
        {
            PhoneNumber = phoneNumber
        };

        await _profileRepository.InsertAsync(profile);

        return user;
    }

    public async Task<UserProfile> GetOrCreateProfileAsync(Guid userId, string fullName)
    {
        var profile = await _profileRepository.FindByUserIdAsync(userId);
        if (profile != null)
        {
            return profile;
        }

        profile = new UserProfile(GuidGenerator.Create(), userId, fullName);
        await _profileRepository.InsertAsync(profile);
        return profile;
    }
}
