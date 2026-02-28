using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Dashboard.Dtos;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Employees;
using BaseProject.MachineTools.Enums;
using BaseProject.MachineTools.Transactions;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace BaseProject.MachineTools.Dashboard;

public class DashboardAppService : ApplicationService, IDashboardAppService
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IRepository<DeviceCategory, Guid> _categoryRepository;
    private readonly IBorrowRequestRepository _borrowRequestRepository;
    private readonly IReturnRequestRepository _returnRequestRepository;
    private readonly IDeviceTransactionRepository _transactionRepository;
    private readonly IEmployeeReferenceRepository _employeeRepository;

    public DashboardAppService(
        IDeviceRepository deviceRepository,
        IRepository<DeviceCategory, Guid> categoryRepository,
        IBorrowRequestRepository borrowRequestRepository,
        IReturnRequestRepository returnRequestRepository,
        IDeviceTransactionRepository transactionRepository,
        IEmployeeReferenceRepository employeeRepository)
    {
        _deviceRepository = deviceRepository;
        _categoryRepository = categoryRepository;
        _borrowRequestRepository = borrowRequestRepository;
        _returnRequestRepository = returnRequestRepository;
        _transactionRepository = transactionRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<DashboardDto> GetStatsAsync()
    {
        var totalDevices = await _deviceRepository.GetCountAsync();
        var availableDevices = await _deviceRepository.GetCountAsync(status: DeviceStatus.Available);
        var inUseDevices = await _deviceRepository.GetCountAsync(status: DeviceStatus.InUse);
        var brokenDevices = await _deviceRepository.GetCountAsync(status: DeviceStatus.Broken);
        var totalCategories = await _categoryRepository.GetCountAsync();
        var pendingBorrows = await _borrowRequestRepository.GetCountAsync(status: BorrowRequestStatus.Pending);
        var pendingReturns = await _returnRequestRepository.GetCountAsync(status: ReturnRequestStatus.Pending);
        var overdueRequests = await _borrowRequestRepository.GetCountAsync(status: BorrowRequestStatus.Overdue);
        var totalEmployees = await _employeeRepository.GetCountAsync();

        var today = DateTime.UtcNow.Date;
        var todayTransactions = await _transactionRepository.GetCountAsync(fromDate: today, toDate: today.AddDays(1));

        return new DashboardDto
        {
            TotalDevices = (int)totalDevices,
            AvailableDevices = (int)availableDevices,
            InUseDevices = (int)inUseDevices,
            BrokenDevices = (int)brokenDevices,
            TotalCategories = (int)totalCategories,
            PendingBorrowRequests = (int)pendingBorrows,
            PendingReturnRequests = (int)pendingReturns,
            OverdueRequests = (int)overdueRequests,
            TotalEmployees = (int)totalEmployees,
            TodayTransactions = (int)todayTransactions
        };
    }
}
