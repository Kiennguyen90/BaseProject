using BaseProject.MachineTools.Borrowing.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Borrowing;

public interface IReturnRequestAppService : IApplicationService
{
    Task<ReturnRequestDto> GetAsync(Guid id);
    Task<PagedResultDto<ReturnRequestDto>> GetListAsync(ReturnRequestListFilterDto input);
    Task<PagedResultDto<ReturnRequestDto>> GetMyListAsync(PagedAndSortedResultRequestDto input);
    Task<ReturnRequestDto> CreateAsync(CreateReturnRequestDto input);
    Task<ReturnRequestDto> ConfirmAsync(Guid id, ConfirmReturnDto input);
    Task<ReturnRequestDto> RejectAsync(Guid id, RejectReturnDto input);
}

public class ReturnRequestListFilterDto : PagedAndSortedResultRequestDto
{
    public Guid? BorrowRequestId { get; set; }
    public Guid? EmployeeId { get; set; }
    public ReturnRequestStatus? Status { get; set; }
}
