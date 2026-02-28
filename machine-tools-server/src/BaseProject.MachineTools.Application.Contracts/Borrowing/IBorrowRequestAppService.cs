using BaseProject.MachineTools.Borrowing.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Borrowing;

public interface IBorrowRequestAppService : IApplicationService
{
    Task<BorrowRequestDto> GetAsync(Guid id);
    Task<PagedResultDto<BorrowRequestDto>> GetListAsync(BorrowRequestListFilterDto input);
    Task<PagedResultDto<BorrowRequestDto>> GetMyListAsync(PagedAndSortedResultRequestDto input);
    Task<BorrowRequestDto> CreateAsync(CreateBorrowRequestDto input);
    Task<BorrowRequestDto> ApproveAsync(Guid id, ApproveBorrowRequestDto input);
    Task<BorrowRequestDto> RejectAsync(Guid id, RejectBorrowRequestDto input);
    Task<PagedResultDto<BorrowRequestDto>> GetPendingAsync(PagedAndSortedResultRequestDto input);
    Task<PagedResultDto<BorrowRequestDto>> GetOverdueAsync(PagedAndSortedResultRequestDto input);
}

public class BorrowRequestListFilterDto : PagedAndSortedResultRequestDto
{
    public Guid? DeviceId { get; set; }
    public Guid? EmployeeId { get; set; }
    public BorrowRequestStatus? Status { get; set; }
}
