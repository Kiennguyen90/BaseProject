using Volo.Abp.Domain.Entities.Auditing;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Transactions;

public class DeviceTransaction : CreationAuditedAggregateRoot<Guid>
{
    public Guid DeviceId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public Guid? BorrowRequestId { get; private set; }
    public Guid? ReturnRequestId { get; private set; }
    public TransactionType TransactionType { get; private set; }
    public int Quantity { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public string? Notes { get; set; }
    public Guid PerformedBy { get; private set; }

    protected DeviceTransaction() { }

    public DeviceTransaction(
        Guid id,
        Guid deviceId,
        Guid employeeId,
        TransactionType transactionType,
        int quantity,
        DateTime transactionDate,
        Guid performedBy,
        Guid? borrowRequestId = null,
        Guid? returnRequestId = null,
        string? notes = null)
        : base(id)
    {
        DeviceId = deviceId;
        EmployeeId = employeeId;
        TransactionType = transactionType;
        Quantity = quantity;
        TransactionDate = transactionDate;
        PerformedBy = performedBy;
        BorrowRequestId = borrowRequestId;
        ReturnRequestId = returnRequestId;
        Notes = notes;
    }
}
