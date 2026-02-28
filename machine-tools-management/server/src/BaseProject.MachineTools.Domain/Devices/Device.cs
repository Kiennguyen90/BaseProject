using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using BaseProject.MachineTools.Enums;
using BaseProject.MachineTools.Borrowing;

namespace BaseProject.MachineTools.Devices;

public class Device : FullAuditedAggregateRoot<Guid>
{
    public Guid CategoryId { get; private set; }
    public string Name { get; private set; } = null!;
    public string Code { get; private set; } = null!;
    public string? Description { get; set; }
    public DeviceType DeviceType { get; private set; }
    public int TotalQuantity { get; private set; }
    public int AvailableQuantity { get; private set; }
    public DeviceStatus Status { get; private set; }
    public string? Location { get; set; }
    public string? SerialNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public DeviceCategory Category { get; set; } = null!;
    public ICollection<DeviceImage> Images { get; set; } = new List<DeviceImage>();
    public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();

    protected Device() { }

    public Device(
        Guid id,
        Guid categoryId,
        string name,
        string code,
        DeviceType deviceType,
        int totalQuantity,
        string? description = null)
        : base(id)
    {
        CategoryId = categoryId;
        SetName(name);
        SetCode(code);
        DeviceType = deviceType;
        SetQuantity(totalQuantity);
        Status = DeviceStatus.Available;
        Description = description;
    }

    public void SetName(string name)
    {
        Name = Check.NotNullOrWhiteSpace(name, nameof(name), maxLength: 256);
    }

    public void SetCode(string code)
    {
        Code = Check.NotNullOrWhiteSpace(code, nameof(code), maxLength: 32);
    }

    public void SetQuantity(int totalQuantity)
    {
        if (totalQuantity < 0)
            throw new UserFriendlyException("Total quantity cannot be negative.");

        var diff = totalQuantity - TotalQuantity;
        TotalQuantity = totalQuantity;
        AvailableQuantity = Math.Max(0, AvailableQuantity + diff);
        UpdateStatus();
    }

    public void Borrow(int quantity)
    {
        if (quantity <= 0)
            throw new UserFriendlyException("Borrow quantity must be positive.");
        if (quantity > AvailableQuantity)
            throw new UserFriendlyException($"Not enough available quantity. Available: {AvailableQuantity}, Requested: {quantity}");

        AvailableQuantity -= quantity;

        // For consumables, also reduce total
        if (DeviceType == DeviceType.Consumable)
        {
            TotalQuantity -= quantity;
        }

        UpdateStatus();
    }

    public void Return(int quantity)
    {
        if (quantity <= 0)
            throw new UserFriendlyException("Return quantity must be positive.");

        AvailableQuantity += quantity;
        if (AvailableQuantity > TotalQuantity)
            AvailableQuantity = TotalQuantity;

        UpdateStatus();
    }

    public void MarkBroken(int quantity)
    {
        if (quantity <= 0)
            throw new UserFriendlyException("Broken quantity must be positive.");

        TotalQuantity -= quantity;
        if (TotalQuantity < 0) TotalQuantity = 0;
        if (AvailableQuantity > TotalQuantity)
            AvailableQuantity = TotalQuantity;

        UpdateStatus();
    }

    public void Consume(int quantity)
    {
        // Same as borrow for consumables
        Borrow(quantity);
    }

    private void UpdateStatus()
    {
        if (TotalQuantity == 0)
            Status = DeviceStatus.Retired;
        else if (AvailableQuantity == 0)
            Status = DeviceStatus.InUse;
        else
            Status = DeviceStatus.Available;
    }

    public void SetCategory(Guid categoryId)
    {
        CategoryId = categoryId;
    }
}
