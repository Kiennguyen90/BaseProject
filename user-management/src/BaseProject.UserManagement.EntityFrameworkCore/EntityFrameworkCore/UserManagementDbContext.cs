using BaseProject.UserManagement.Users;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.Identity.EntityFrameworkCore;

namespace BaseProject.UserManagement.EntityFrameworkCore;

[ConnectionStringName("Default")]
public class UserManagementDbContext : AbpDbContext<UserManagementDbContext>
{
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;

    public UserManagementDbContext(DbContextOptions<UserManagementDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure ABP Identity tables
        builder.ConfigureIdentity();

        // Configure UserProfile
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
