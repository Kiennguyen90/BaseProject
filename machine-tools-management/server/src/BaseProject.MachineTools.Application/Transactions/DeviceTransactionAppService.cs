using BaseProject.MachineTools.Employees;
using BaseProject.MachineTools.Transactions.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Users;

namespace BaseProject.MachineTools.Transactions;

public class DeviceTransactionAppService : ApplicationService, IDeviceTransactionAppService
{
    private readonly IDeviceTransactionRepository _transactionRepository;
    private readonly IEmployeeReferenceRepository _employeeRepository;

    public DeviceTransactionAppService(
        IDeviceTransactionRepository transactionRepository,
        IEmployeeReferenceRepository employeeRepository)
    {
        _transactionRepository = transactionRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<PagedResultDto<DeviceTransactionDto>> GetListAsync(TransactionFilterDto input)
    {
        var totalCount = await _transactionRepository.GetCountAsync(
            input.DeviceId, input.EmployeeId, input.TransactionType, input.FromDate, input.ToDate);

        var transactions = await _transactionRepository.GetListAsync(
            input.DeviceId, input.EmployeeId, input.TransactionType, input.FromDate, input.ToDate,
            input.SkipCount, input.MaxResultCount, input.Sorting);

        var dtos = ObjectMapper.Map<List<DeviceTransaction>, List<DeviceTransactionDto>>(transactions);
        return new PagedResultDto<DeviceTransactionDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<DeviceTransactionDto>> GetByDeviceAsync(Guid deviceId, PagedAndSortedResultRequestDto input)
    {
        var transactions = await _transactionRepository.GetByDeviceAsync(deviceId, input.SkipCount, input.MaxResultCount);
        var totalCount = await _transactionRepository.GetCountAsync(deviceId: deviceId);

        var dtos = ObjectMapper.Map<List<DeviceTransaction>, List<DeviceTransactionDto>>(transactions);
        return new PagedResultDto<DeviceTransactionDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<DeviceTransactionDto>> GetByEmployeeAsync(Guid employeeId, PagedAndSortedResultRequestDto input)
    {
        var transactions = await _transactionRepository.GetByEmployeeAsync(employeeId, input.SkipCount, input.MaxResultCount);
        var totalCount = await _transactionRepository.GetCountAsync(employeeId: employeeId);

        var dtos = ObjectMapper.Map<List<DeviceTransaction>, List<DeviceTransactionDto>>(transactions);
        return new PagedResultDto<DeviceTransactionDto>(totalCount, dtos);
    }

    public async Task<PagedResultDto<DeviceTransactionDto>> GetMyListAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var employee = await _employeeRepository.FindByUserIdAsync(userId);
        if (employee == null)
            throw new UserFriendlyException("Employee reference not found.");

        return await GetByEmployeeAsync(employee.Id, input);
    }
}
