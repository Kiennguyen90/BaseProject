using BaseProject.MachineTools.Enums;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Transactions.Dtos;

public class TransactionFilterDto : PagedAndSortedResultRequestDto
{
    public Guid? DeviceId { get; set; }
    public Guid? EmployeeId { get; set; }
    public TransactionType? TransactionType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
