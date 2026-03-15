using BaseProject.UserManagement.Users;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.PermissionManagement;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement;
using Volo.Abp.SettingManagement.EntityFrameworkCore;

namespace BaseProject.UserManagement.EntityFrameworkCore;

[ConnectionStringName("Default")]
public class UserManagementDbContext : AbpDbContext<UserManagementDbContext>,
    IIdentityDbContext,
    IPermissionManagementDbContext,
    ISettingManagementDbContext
{
    // Custom
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;

    // IIdentityDbContext
    public DbSet<IdentityUser> Users { get; set; } = null!;
    public DbSet<IdentityRole> Roles { get; set; } = null!;
    public DbSet<IdentityClaimType> ClaimTypes { get; set; } = null!;
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; } = null!;
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; } = null!;
    public DbSet<IdentityLinkUser> LinkUsers { get; set; } = null!;
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; } = null!;
    public DbSet<IdentitySession> Sessions { get; set; } = null!;

    // IPermissionManagementDbContext
    public DbSet<PermissionGrant> PermissionGrants { get; set; } = null!;
    public DbSet<PermissionGroupDefinitionRecord> PermissionGroups { get; set; } = null!;
    public DbSet<PermissionDefinitionRecord> Permissions { get; set; } = null!;

    // ISettingManagementDbContext
    public DbSet<Setting> Settings { get; set; } = null!;
    public DbSet<SettingDefinitionRecord> SettingDefinitionRecords { get; set; } = null!;

    public UserManagementDbContext(DbContextOptions<UserManagementDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("usermanagement");

        builder.ConfigureIdentity();
        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();

        builder.Entity<UserProfile>(b =>
        {
            b.ToTable("AppUserProfiles");
            b.ConfigureByConvention();

            b.Property(x => x.FullName).IsRequired().HasMaxLength(128);
            b.Property(x => x.PhoneNumber).HasMaxLength(16);
            b.Property(x => x.AvatarUrl).HasMaxLength(512);
            b.Property(x => x.Department).HasMaxLength(128);
            b.Property(x => x.EmployeeCode).HasMaxLength(32);
            b.Property(x => x.Address).HasMaxLength(512);

            b.HasIndex(x => x.UserId).IsUnique();
        });
    }
}
