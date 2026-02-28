using Volo.Abp;
using Volo.Abp.Domain.Services;
using BaseProject.MachineTools.Devices;
using BaseProject.MachineTools.Employees;
using BaseProject.MachineTools.Enums;
using BaseProject.MachineTools.Transactions;

namespace BaseProject.MachineTools.Borrowing;

public class BorrowingManager : DomainService
{
    private readonly IBorrowRequestRepository _borrowRequestRepository;
    private readonly IReturnRequestRepository _returnRequestRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceTransactionRepository _transactionRepository;

    public BorrowingManager(
        IBorrowRequestRepository borrowRequestRepository,
        IReturnRequestRepository returnRequestRepository,
        IDeviceRepository deviceRepository,
        IDeviceTransactionRepository transactionRepository)
    {
        _borrowRequestRepository = borrowRequestRepository;
        _returnRequestRepository = returnRequestRepository;
        _deviceRepository = deviceRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<BorrowRequest> CreateBorrowRequestAsync(
        Guid deviceId,
        Guid employeeId,
        int quantity,
        DateTime expectedReturnDate,
        string? purpose = null)
    {
        var device = await _deviceRepository.GetAsync(deviceId);

        if (device.AvailableQuantity < quantity)
        {
            throw new UserFriendlyException(
                $"Not enough available quantity for device '{device.Name}'. Available: {device.AvailableQuantity}, Requested: {quantity}");
        }

        var request = new BorrowRequest(
            GuidGenerator.Create(),
            deviceId,
            employeeId,
            quantity,
            DateTime.UtcNow,
            expectedReturnDate,
            purpose
        );

        return await _borrowRequestRepository.InsertAsync(request);
    }

    public async Task ApproveBorrowRequestAsync(BorrowRequest request, Guid adminId)
    {
        var device = await _deviceRepository.GetAsync(request.DeviceId);

        if (device.AvailableQuantity < request.Quantity)
        {
            throw new UserFriendlyException(
                $"Not enough available quantity for device '{device.Name}'. Available: {device.AvailableQuantity}");
        }

        request.Approve(adminId);
        device.Borrow(request.Quantity);

        // Create transaction record
        var transaction = new DeviceTransaction(
            GuidGenerator.Create(),
            device.Id,
            request.EmployeeId,
            device.DeviceType == DeviceType.Consumable ? TransactionType.Consume : TransactionType.Borrow,
            request.Quantity,
            DateTime.UtcNow,
            adminId,
            borrowRequestId: request.Id
        );

        await _deviceRepository.UpdateAsync(device);
        await _borrowRequestRepository.UpdateAsync(request);
        await _transactionRepository.InsertAsync(transaction);
    }

    public async Task RejectBorrowRequestAsync(BorrowRequest request, Guid adminId, string reason)
    {
        request.Reject(adminId, reason);
        await _borrowRequestRepository.UpdateAsync(request);
    }

    public async Task<ReturnRequest> CreateReturnRequestAsync(
        Guid borrowRequestId,
        Guid employeeId,
        int quantity,
        string? condition = null,
        bool isBroken = false,
        string? brokenDescription = null)
    {
        var borrowRequest = await _borrowRequestRepository.GetAsync(borrowRequestId);

        if (borrowRequest.EmployeeId != employeeId)
            throw new UserFriendlyException("You can only return your own borrowed items.");

        if (borrowRequest.Status != BorrowRequestStatus.Approved && borrowRequest.Status != BorrowRequestStatus.Overdue)
            throw new UserFriendlyException("Can only return items from approved or overdue borrow requests.");

        var returnRequest = new ReturnRequest(
            GuidGenerator.Create(),
            borrowRequestId,
            borrowRequest.DeviceId,
            employeeId,
            quantity,
            DateTime.UtcNow,
            condition
        );

        if (isBroken && !string.IsNullOrWhiteSpace(brokenDescription))
        {
            returnRequest.MarkAsBroken(brokenDescription);
        }

        return await _returnRequestRepository.InsertAsync(returnRequest);
    }

    public async Task ConfirmReturnAsync(ReturnRequest returnRequest, Guid adminId)
    {
        var device = await _deviceRepository.GetAsync(returnRequest.DeviceId);

        returnRequest.Confirm(adminId);

        if (returnRequest.IsBroken)
        {
            device.MarkBroken(returnRequest.Quantity);
        }
        else
        {
            device.Return(returnRequest.Quantity);
        }

        // Create transaction record
        var transactionType = returnRequest.IsBroken ? TransactionType.BrokenReport : TransactionType.Return;
        var transaction = new DeviceTransaction(
            GuidGenerator.Create(),
            device.Id,
            returnRequest.EmployeeId,
            transactionType,
            returnRequest.Quantity,
            DateTime.UtcNow,
            adminId,
            returnRequestId: returnRequest.Id
        );

        // Check if all quantity returned
        var borrowRequest = await _borrowRequestRepository.GetAsync(returnRequest.BorrowRequestId);
        borrowRequest.MarkReturned(DateTime.UtcNow);

        await _deviceRepository.UpdateAsync(device);
        await _returnRequestRepository.UpdateAsync(returnRequest);
        await _borrowRequestRepository.UpdateAsync(borrowRequest);
        await _transactionRepository.InsertAsync(transaction);
    }

    public async Task RejectReturnAsync(ReturnRequest returnRequest, Guid adminId, string reason)
    {
        returnRequest.Reject(adminId, reason);
        await _returnRequestRepository.UpdateAsync(returnRequest);
    }
}
