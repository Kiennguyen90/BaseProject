using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Borrowing.Dtos;

public class BorrowRequestDto
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public string DeviceName { get; set; } = null!;
    public string DeviceCode { get; set; } = null!;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public string? EmployeeCode { get; set; }
    public int Quantity { get; set; }
    public DateTime BorrowDate { get; set; }
    public DateTime ExpectedReturnDate { get; set; }
    public DateTime? ActualReturnDate { get; set; }
    public BorrowRequestStatus Status { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreationTime { get; set; }
}
