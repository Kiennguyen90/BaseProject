using BaseProject.MachineTools.Borrowing.Dtos;
using BaseProject.MachineTools.Employees;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Users;

namespace BaseProject.MachineTools.Borrowing;

public class ReturnRequestAppService : ApplicationService, IReturnRequestAppService
{
    private readonly IReturnRequestRepository _returnRequestRepository;
    private readonly BorrowingManager _borrowingManager;
    private readonly IEmployeeReferenceRepository _employeeRepository;

    public ReturnRequestAppService(
        IReturnRequestRepository returnRequestRepository,
        BorrowingManager borrowingManager,
        IEmployeeReferenceRepository employeeRepository)
    {
        _returnRequestRepository = returnRequestRepository;
        _borrowingManager = borrowingManager;
        _employeeRepository = employeeRepository;
    }

    public async Task<ReturnRequestDto> GetAsync(Guid id)
    {
        var request = await _returnRequestRepository.GetAsync(id);
        return ObjectMapper.Map<ReturnRequest, ReturnRequestDto>(request);
    }

    public async Task<PagedResultDto<ReturnRequestDto>> GetListAsync(ReturnRequestListFilterDto input)
    {
        var totalCount = await _returnRequestRepository.GetCountAsync(
            input.BorrowRequestId, input.EmployeeId, input.Status);

        var requests = await _returnRequestRepository.GetListAsync(
            input.BorrowRequestId, input.EmployeeId, input.Status,
            input.SkipCount, input.MaxResultCount, input.Sorting, includeDetails: true);

        var dtos = ObjectMapper.Map<List<ReturnRequest>, List<ReturnRequestDto>>(requests);
        return new PagedResultDto<ReturnRequestDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<ReturnRequestDto>> GetMyListAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var employee = await _employeeRepository.FindByUserIdAsync(userId);
        if (employee == null)
            throw new UserFriendlyException("Employee reference not found.");

        var requests = await _returnRequestRepository.GetByEmployeeAsync(
            employee.Id, input.SkipCount, input.MaxResultCount);
        var totalCount = await _returnRequestRepository.GetCountAsync(employeeId: employee.Id);

        var dtos = ObjectMapper.Map<List<ReturnRequest>, List<ReturnRequestDto>>(requests);
        return new PagedResultDto<ReturnRequestDto>(totalCount, dtos);
    }

    public async Task<ReturnRequestDto> CreateAsync(CreateReturnRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var employee = await _employeeRepository.FindByUserIdAsync(userId);
        if (employee == null)
            throw new UserFriendlyException("Employee reference not found.");

        var returnRequest = await _borrowingManager.CreateReturnRequestAsync(
            input.BorrowRequestId,
            employee.Id,
            input.Quantity,
            input.Condition,
            input.IsBroken,
            input.BrokenDescription
        );

        return ObjectMapper.Map<ReturnRequest, ReturnRequestDto>(returnRequest);
    }

    public async Task<ReturnRequestDto> ConfirmAsync(Guid id, ConfirmReturnDto input)
    {
        var request = await _returnRequestRepository.GetAsync(id);
        var adminId = CurrentUser.GetId();

        await _borrowingManager.ConfirmReturnAsync(request, adminId);

        return ObjectMapper.Map<ReturnRequest, ReturnRequestDto>(request);
    }

    public async Task<ReturnRequestDto> RejectAsync(Guid id, RejectReturnDto input)
    {
        var request = await _returnRequestRepository.GetAsync(id);
        var adminId = CurrentUser.GetId();

        await _borrowingManager.RejectReturnAsync(request, adminId, input.Reason);

        return ObjectMapper.Map<ReturnRequest, ReturnRequestDto>(request);
    }
}
