using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using BaseProject.MachineTools.Enums;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Employees;

namespace BaseProject.MachineTools.Borrowing;

public class ReturnRequest : FullAuditedAggregateRoot<Guid>
{
    public Guid BorrowRequestId { get; private set; }
    public Guid DeviceId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public int Quantity { get; private set; }
    public DateTime ReturnDate { get; private set; }
    public ReturnRequestStatus Status { get; private set; }
    public string? Condition { get; set; }
    public bool IsBroken { get; private set; }
    public string? BrokenDescription { get; set; }
    public Guid? ConfirmedBy { get; private set; }
    public DateTime? ConfirmedDate { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? Notes { get; set; }

    // Navigation
    public BorrowRequest BorrowRequest { get; set; } = null!;
    public Device Device { get; set; } = null!;
    public EmployeeReference Employee { get; set; } = null!;
    public ICollection<DeviceImage> Images { get; set; } = new List<DeviceImage>();

    protected ReturnRequest() { }

    public ReturnRequest(
        Guid id,
        Guid borrowRequestId,
        Guid deviceId,
        Guid employeeId,
        int quantity,
        DateTime returnDate,
        string? condition = null)
        : base(id)
    {
        BorrowRequestId = borrowRequestId;
        DeviceId = deviceId;
        EmployeeId = employeeId;

        if (quantity <= 0)
            throw new UserFriendlyException("Return quantity must be positive.");
        Quantity = quantity;
        ReturnDate = returnDate;
        Status = ReturnRequestStatus.Pending;
        Condition = condition;
    }

    public void Confirm(Guid adminId)
    {
        if (Status != ReturnRequestStatus.Pending)
            throw new UserFriendlyException("Only pending return requests can be confirmed.");

        Status = ReturnRequestStatus.Confirmed;
        ConfirmedBy = adminId;
        ConfirmedDate = DateTime.UtcNow;
    }

    public void Reject(Guid adminId, string reason)
    {
        if (Status != ReturnRequestStatus.Pending)
            throw new UserFriendlyException("Only pending return requests can be rejected.");

        Status = ReturnRequestStatus.Rejected;
        ConfirmedBy = adminId;
        ConfirmedDate = DateTime.UtcNow;
        RejectionReason = reason;
    }

    public void MarkAsBroken(string description)
    {
        IsBroken = true;
        BrokenDescription = description;
    }
}
