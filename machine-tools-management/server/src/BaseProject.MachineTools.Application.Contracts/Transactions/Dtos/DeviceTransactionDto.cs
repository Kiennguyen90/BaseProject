using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Transactions.Dtos;

public class DeviceTransactionDto
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public string DeviceName { get; set; } = null!;
    public string DeviceCode { get; set; } = null!;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public Guid? BorrowRequestId { get; set; }
    public Guid? ReturnRequestId { get; set; }
    public TransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public DateTime TransactionDate { get; set; }
    public string? Notes { get; set; }
    public Guid PerformedBy { get; set; }
    public DateTime CreationTime { get; set; }
}
