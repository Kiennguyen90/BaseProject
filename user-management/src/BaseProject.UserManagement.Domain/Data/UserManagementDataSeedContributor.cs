using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;
using BaseProject.UserManagement.Consts;

namespace BaseProject.UserManagement.Data;

public class UserManagementDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IdentityUserManager _userManager;
    private readonly IIdentityRoleRepository _roleRepository;
    private readonly IdentityRoleManager _roleManager;
    private readonly Users.IUserProfileRepository _profileRepository;

    public UserManagementDataSeedContributor(
        IdentityUserManager userManager,
        IIdentityRoleRepository roleRepository,
        IdentityRoleManager roleManager,
        Users.IUserProfileRepository profileRepository)
    {
        _userManager = userManager;
        _roleRepository = roleRepository;
        _roleManager = roleManager;
        _profileRepository = profileRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        await SeedRolesAsync();
        await SeedAdminUserAsync();
    }

    private async Task SeedRolesAsync()
    {
        var adminRole = await _roleRepository.FindByNormalizedNameAsync(RoleConsts.Admin.ToUpperInvariant());
        if (adminRole == null)
        {
            await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), RoleConsts.Admin)
            {
                IsStatic = true,
                IsPublic = true
            });
        }
        else if (adminRole.Name != RoleConsts.Admin)
        {
            // ABP default seeder creates "admin" (lowercase) — rename to match RoleConsts
            await _roleManager.SetRoleNameAsync(adminRole, RoleConsts.Admin);
        }

        var employeeRole = await _roleRepository.FindByNormalizedNameAsync(RoleConsts.Employee.ToUpperInvariant());
        if (employeeRole == null)
        {
            await _roleManager.CreateAsync(new IdentityRole(Guid.NewGuid(), RoleConsts.Employee)
            {
                IsStatic = true,
                IsPublic = true,
                IsDefault = true
            });
        }
        else if (employeeRole.Name != RoleConsts.Employee)
        {
            await _roleManager.SetRoleNameAsync(employeeRole, RoleConsts.Employee);
        }
    }

    private async Task SeedAdminUserAsync()
    {
        const string adminUserName = "admin";
        const string adminEmail = "admin@baseproject.com";
        const string adminPassword = "Admin@123456";

        var adminUser = await _userManager.FindByNameAsync(adminUserName);

        if (adminUser == null)
        {
            adminUser = new IdentityUser(Guid.NewGuid(), adminUserName, adminEmail);
            adminUser.SetPhoneNumber("0900000000", true);

            var result = await _userManager.CreateAsync(adminUser, adminPassword);
            if (!result.Succeeded) return;
        }
        else
        {
            // ABP's default IdentityDataSeedContributor seeds admin@abp.io — override it
            if (!string.Equals(adminUser.Email, adminEmail, StringComparison.OrdinalIgnoreCase))
            {
                await _userManager.SetEmailAsync(adminUser, adminEmail);
            }

            await _userManager.RemovePasswordAsync(adminUser);
            await _userManager.AddPasswordAsync(adminUser, adminPassword);
        }

        if (!await _userManager.IsInRoleAsync(adminUser, RoleConsts.Admin))
        {
            await _userManager.AddToRoleAsync(adminUser, RoleConsts.Admin);
        }

        var existingProfile = await _profileRepository.FindByUserIdAsync(adminUser.Id);
        if (existingProfile == null)
        {
            var profile = new Users.UserProfile(
                Guid.NewGuid(),
                adminUser.Id,
                "System Administrator"
            )
            {
                PhoneNumber = "0900000000",
                Department = "IT",
                EmployeeCode = "ADMIN001"
            };
            await _profileRepository.InsertAsync(profile);
        }
    }
}
