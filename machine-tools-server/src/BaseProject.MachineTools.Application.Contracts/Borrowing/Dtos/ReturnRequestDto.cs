using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Borrowing.Dtos;

public class ReturnRequestDto
{
    public Guid Id { get; set; }
    public Guid BorrowRequestId { get; set; }
    public Guid DeviceId { get; set; }
    public string DeviceName { get; set; } = null!;
    public string DeviceCode { get; set; } = null!;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public int Quantity { get; set; }
    public DateTime ReturnDate { get; set; }
    public ReturnRequestStatus Status { get; set; }
    public string? Condition { get; set; }
    public bool IsBroken { get; set; }
    public string? BrokenDescription { get; set; }
    public Guid? ConfirmedBy { get; set; }
    public DateTime? ConfirmedDate { get; set; }
    public string? RejectionReason { get; set; }
    public string? Notes { get; set; }
    public DateTime CreationTime { get; set; }
}
