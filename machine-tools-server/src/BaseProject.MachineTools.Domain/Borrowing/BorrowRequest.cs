using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using BaseProject.MachineTools.Enums;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Employees;

namespace BaseProject.MachineTools.Borrowing;

public class BorrowRequest : FullAuditedAggregateRoot<Guid>
{
    public Guid DeviceId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public int Quantity { get; private set; }
    public DateTime BorrowDate { get; private set; }
    public DateTime ExpectedReturnDate { get; private set; }
    public DateTime? ActualReturnDate { get; private set; }
    public BorrowRequestStatus Status { get; private set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? RejectionReason { get; private set; }

    // Navigation
    public Device Device { get; set; } = null!;
    public EmployeeReference Employee { get; set; } = null!;
    public ICollection<ReturnRequest> ReturnRequests { get; set; } = new List<ReturnRequest>();
    public ICollection<DeviceImage> Images { get; set; } = new List<DeviceImage>();

    protected BorrowRequest() { }

    public BorrowRequest(
        Guid id,
        Guid deviceId,
        Guid employeeId,
        int quantity,
        DateTime borrowDate,
        DateTime expectedReturnDate,
        string? purpose = null)
        : base(id)
    {
        DeviceId = deviceId;
        EmployeeId = employeeId;
        SetQuantity(quantity);
        BorrowDate = borrowDate;
        ExpectedReturnDate = expectedReturnDate;
        Status = BorrowRequestStatus.Pending;
        Purpose = purpose;
    }

    private void SetQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new UserFriendlyException("Quantity must be positive.");
        Quantity = quantity;
    }

    public void Approve(Guid adminId)
    {
        if (Status != BorrowRequestStatus.Pending)
            throw new UserFriendlyException("Only pending requests can be approved.");

        Status = BorrowRequestStatus.Approved;
        ApprovedBy = adminId;
        ApprovedDate = DateTime.UtcNow;
    }

    public void Reject(Guid adminId, string reason)
    {
        if (Status != BorrowRequestStatus.Pending)
            throw new UserFriendlyException("Only pending requests can be rejected.");

        Status = BorrowRequestStatus.Rejected;
        ApprovedBy = adminId;
        ApprovedDate = DateTime.UtcNow;
        RejectionReason = reason;
    }

    public void MarkReturned(DateTime returnDate)
    {
        if (Status != BorrowRequestStatus.Approved && Status != BorrowRequestStatus.Overdue)
            throw new UserFriendlyException("Only approved or overdue requests can be marked as returned.");

        Status = BorrowRequestStatus.Returned;
        ActualReturnDate = returnDate;
    }

    public void MarkOverdue()
    {
        if (Status != BorrowRequestStatus.Approved)
            throw new UserFriendlyException("Only approved requests can be marked as overdue.");

        Status = BorrowRequestStatus.Overdue;
    }
}
