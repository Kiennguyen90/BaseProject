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
        if (await _roleRepository.FindByNormalizedNameAsync(RoleConsts.Admin.ToUpperInvariant()) == null)
        {
            var adminRole = new IdentityRole(Guid.NewGuid(), RoleConsts.Admin)
            {
                IsStatic = true,
                IsPublic = true
            };
            await _roleManager.CreateAsync(adminRole);
        }

        if (await _roleRepository.FindByNormalizedNameAsync(RoleConsts.Employee.ToUpperInvariant()) == null)
        {
            var employeeRole = new IdentityRole(Guid.NewGuid(), RoleConsts.Employee)
            {
                IsStatic = true,
                IsPublic = true,
                IsDefault = true
            };
            await _roleManager.CreateAsync(employeeRole);
        }
    }

    private async Task SeedAdminUserAsync()
    {
        const string adminUserName = "admin";
        const string adminEmail = "admin@baseproject.com";
        const string adminPassword = "Admin@123456";

        var existingUser = await _userManager.FindByNameAsync(adminUserName);
        if (existingUser != null) return;

        var adminUser = new IdentityUser(Guid.NewGuid(), adminUserName, adminEmail);
        adminUser.SetPhoneNumber("0900000000", true);

        var result = await _userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(adminUser, RoleConsts.Admin);

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
