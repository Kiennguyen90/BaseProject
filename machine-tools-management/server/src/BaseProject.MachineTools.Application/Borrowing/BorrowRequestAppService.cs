using BaseProject.MachineTools.Borrowing.Dtos;
using BaseProject.MachineTools.Employees;
using BaseProject.MachineTools.Enums;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Users;

namespace BaseProject.MachineTools.Borrowing;

public class BorrowRequestAppService : ApplicationService, IBorrowRequestAppService
{
    private readonly IBorrowRequestRepository _borrowRequestRepository;
    private readonly BorrowingManager _borrowingManager;
    private readonly IEmployeeReferenceRepository _employeeRepository;

    public BorrowRequestAppService(
        IBorrowRequestRepository borrowRequestRepository,
        BorrowingManager borrowingManager,
        IEmployeeReferenceRepository employeeRepository)
    {
        _borrowRequestRepository = borrowRequestRepository;
        _borrowingManager = borrowingManager;
        _employeeRepository = employeeRepository;
    }

    public async Task<BorrowRequestDto> GetAsync(Guid id)
    {
        var request = await _borrowRequestRepository.GetAsync(id);
        return ObjectMapper.Map<BorrowRequest, BorrowRequestDto>(request);
    }

    public async Task<PagedResultDto<BorrowRequestDto>> GetListAsync(BorrowRequestListFilterDto input)
    {
        var totalCount = await _borrowRequestRepository.GetCountAsync(
            input.DeviceId, input.EmployeeId, input.Status);

        var requests = await _borrowRequestRepository.GetListAsync(
            input.DeviceId, input.EmployeeId, input.Status,
            input.SkipCount, input.MaxResultCount, input.Sorting, includeDetails: true);

        var dtos = ObjectMapper.Map<List<BorrowRequest>, List<BorrowRequestDto>>(requests);
        return new PagedResultDto<BorrowRequestDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<BorrowRequestDto>> GetMyListAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var employee = await _employeeRepository.FindByUserIdAsync(userId);
        if (employee == null)
            throw new UserFriendlyException("Employee reference not found.");

        var requests = await _borrowRequestRepository.GetByEmployeeAsync(
            employee.Id, input.SkipCount, input.MaxResultCount);
        var totalCount = await _borrowRequestRepository.GetCountAsync(employeeId: employee.Id);

        var dtos = ObjectMapper.Map<List<BorrowRequest>, List<BorrowRequestDto>>(requests);
        return new PagedResultDto<BorrowRequestDto>(totalCount, dtos);
    }

    public async Task<BorrowRequestDto> CreateAsync(CreateBorrowRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var employee = await _employeeRepository.FindByUserIdAsync(userId);
        if (employee == null)
            throw new UserFriendlyException("Employee reference not found.");

        var request = await _borrowingManager.CreateBorrowRequestAsync(
            input.DeviceId,
            employee.Id,
            input.Quantity,
            input.ExpectedReturnDate,
            input.Purpose
        );

        return ObjectMapper.Map<BorrowRequest, BorrowRequestDto>(request);
    }

    public async Task<BorrowRequestDto> ApproveAsync(Guid id, ApproveBorrowRequestDto input)
    {
        var request = await _borrowRequestRepository.GetAsync(id);
        var adminId = CurrentUser.GetId();

        await _borrowingManager.ApproveBorrowRequestAsync(request, adminId);

        return ObjectMapper.Map<BorrowRequest, BorrowRequestDto>(request);
    }

    public async Task<BorrowRequestDto> RejectAsync(Guid id, RejectBorrowRequestDto input)
    {
        var request = await _borrowRequestRepository.GetAsync(id);
        var adminId = CurrentUser.GetId();

        await _borrowingManager.RejectBorrowRequestAsync(request, adminId, input.Reason);

        return ObjectMapper.Map<BorrowRequest, BorrowRequestDto>(request);
    }

    public async Task<PagedResultDto<BorrowRequestDto>> GetPendingAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _borrowRequestRepository.GetCountAsync(status: BorrowRequestStatus.Pending);
        var requests = await _borrowRequestRepository.GetListAsync(
            status: BorrowRequestStatus.Pending,
            skipCount: input.SkipCount,
            maxResultCount: input.MaxResultCount,
            sorting: input.Sorting,
            includeDetails: true);

        var dtos = ObjectMapper.Map<List<BorrowRequest>, List<BorrowRequestDto>>(requests);
        return new PagedResultDto<BorrowRequestDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<BorrowRequestDto>> GetOverdueAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _borrowRequestRepository.GetCountAsync(status: BorrowRequestStatus.Overdue);
        var requests = await _borrowRequestRepository.GetListAsync(
            status: BorrowRequestStatus.Overdue,
            skipCount: input.SkipCount,
            maxResultCount: input.MaxResultCount,
            sorting: input.Sorting,
            includeDetails: true);

        var dtos = ObjectMapper.Map<List<BorrowRequest>, List<BorrowRequestDto>>(requests);
        return new PagedResultDto<BorrowRequestDto>(totalCount, dtos);
    }
}
