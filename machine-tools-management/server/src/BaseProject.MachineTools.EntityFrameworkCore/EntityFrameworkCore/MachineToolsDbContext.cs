using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Transactions;
using BaseProject.MachineTools.Employees;

namespace BaseProject.MachineTools;

[ConnectionStringName("Default")]
public class MachineToolsDbContext : AbpDbContext<MachineToolsDbContext>
{
    public DbSet<Device> Devices { get; set; }
    public DbSet<DeviceCategory> DeviceCategories { get; set; }
    public DbSet<DeviceImage> DeviceImages { get; set; }
    public DbSet<BorrowRequest> BorrowRequests { get; set; }
    public DbSet<ReturnRequest> ReturnRequests { get; set; }
    public DbSet<DeviceTransaction> DeviceTransactions { get; set; }
    public DbSet<EmployeeReference> EmployeeReferences { get; set; }

    public MachineToolsDbContext(DbContextOptions<MachineToolsDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("machinetool");

        builder.Entity<DeviceCategory>(b =>
        {
            b.ToTable("DeviceCategories");
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            b.Property(x => x.Description).HasMaxLength(512);
            b.HasIndex(x => x.Name).IsUnique();
        });

        builder.Entity<Device>(b =>
        {
            b.ToTable("Devices");
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.Code).IsRequired().HasMaxLength(32);
            b.Property(x => x.Description).HasMaxLength(1024);
            b.Property(x => x.Location).HasMaxLength(256);
            b.Property(x => x.SerialNumber).HasMaxLength(128);
            b.Property(x => x.ImageUrl).HasMaxLength(512);
            b.Property(x => x.Notes).HasMaxLength(1024);
            b.HasIndex(x => x.Code).IsUnique();
            b.HasOne(x => x.Category).WithMany(x => x.Devices).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<DeviceImage>(b =>
        {
            b.ToTable("DeviceImages");
            b.ConfigureByConvention();
            b.Property(x => x.ImageUrl).IsRequired().HasMaxLength(512);
            b.Property(x => x.ImageType).IsRequired().HasMaxLength(64);
            b.Property(x => x.Description).HasMaxLength(256);
            b.HasOne(x => x.Device).WithMany(x => x.Images).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<BorrowRequest>(b =>
        {
            b.ToTable("BorrowRequests");
            b.ConfigureByConvention();
            b.Property(x => x.Purpose).HasMaxLength(512);
            b.Property(x => x.Notes).HasMaxLength(1024);
            b.Property(x => x.RejectionReason).HasMaxLength(512);
            b.HasOne(x => x.Device).WithMany(x => x.BorrowRequests).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ReturnRequest>(b =>
        {
            b.ToTable("ReturnRequests");
            b.ConfigureByConvention();
            b.Property(x => x.Condition).HasMaxLength(256);
            b.Property(x => x.BrokenDescription).HasMaxLength(1024);
            b.Property(x => x.RejectionReason).HasMaxLength(512);
            b.Property(x => x.Notes).HasMaxLength(1024);
            b.HasOne(x => x.BorrowRequest).WithMany(x => x.ReturnRequests).HasForeignKey(x => x.BorrowRequestId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Device).WithMany().HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<DeviceTransaction>(b =>
        {
            b.ToTable("DeviceTransactions");
            b.ConfigureByConvention();
            b.Property(x => x.Notes).HasMaxLength(1024);
            b.HasIndex(x => x.DeviceId);
            b.HasIndex(x => x.EmployeeId);
            b.HasIndex(x => x.TransactionDate);
        });

        builder.Entity<EmployeeReference>(b =>
        {
            b.ToTable("EmployeeReferences");
            b.ConfigureByConvention();
            b.Property(x => x.FullName).IsRequired().HasMaxLength(128);
            b.Property(x => x.Email).HasMaxLength(256);
            b.Property(x => x.PhoneNumber).HasMaxLength(16);
            b.Property(x => x.EmployeeCode).HasMaxLength(32);
            b.Property(x => x.Department).HasMaxLength(128);
            b.HasIndex(x => x.UserId).IsUnique();
        });
    }
}
