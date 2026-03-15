# Machine Tools Management — Backend Server Plan

## 1. Architecture Overview

### High-Level Architecture
```
┌───────────────────────────────────────────────────────────────┐
│                     Client Applications                       │
│           (Web Admin, Mobile App)                             │
└──────────────┬────────────────────────────┬───────────────────┘
               │  HTTP/REST + JWT            │
               ▼                             ▼
┌───────────────────────────────────────────────────────────────┐
│            Machine Tools Management API (ABP)                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              HttpApi.Host (ASP.NET Core)                  │ │
│  │  - JWT Validation (from User Management)                 │ │
│  │  - REST API Endpoints                                    │ │
│  │  - File Upload (Images)                                  │ │
│  │  - SignalR Notifications Hub                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Application Layer                            │ │
│  │  - DeviceAppService                                      │ │
│  │  - DeviceCategoryAppService                              │ │
│  │  - BorrowRequestAppService                               │ │
│  │  - ReturnRequestAppService                               │ │
│  │  - DeviceTransactionAppService                           │ │
│  │  - NotificationAppService                                │ │
│  │  - DashboardAppService                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Domain Layer                                 │ │
│  │  - Device, DeviceCategory, BorrowRequest...              │ │
│  │  - Domain Services (BorrowingManager, DeviceManager)     │ │
│  │  - Domain Events                                         │ │
│  │  - Repository Interfaces                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Infrastructure Layer                         │ │
│  │  - EF Core (PostgreSQL)                                  │ │
│  │  - Redis Cache                                           │ │
│  │  - File Storage (Local / Blob)                           │ │
│  │  - Event Bus                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
         │              │                │
         ▼              ▼                ▼
   ┌──────────┐  ┌──────────┐   ┌──────────────────────┐
   │PostgreSQL│  │  Redis   │   │ User Management API  │
   │ Database │  │  Cache   │   │ (Auth Verification)  │
   └──────────┘  └──────────┘   └──────────────────────┘
```

### Cross-Service Communication
```
Machine Tools API                    User Management API
      │                                     │
      │──GET /.well-known/openid-config────▶│
      │◀───JWT signing keys (JWKS)──────────│
      │                                     │
      │  (Validate JWT locally using keys)  │
      │                                     │
      │──GET /api/users/{id} (optional)────▶│
      │◀───User details─────────────────────│
```

---

## 2. Folder Structure

```
base-project-machine-tools-server/
├── src/
│   ├── BaseProject.MachineTools.Domain.Shared/
│   │   ├── BaseProjectMachineToolsDomainSharedModule.cs
│   │   ├── Enums/
│   │   │   ├── DeviceType.cs              # Tool, Consumable
│   │   │   ├── DeviceStatus.cs            # Available, InUse, Broken, Retired
│   │   │   ├── BorrowRequestStatus.cs     # Pending, Approved, Rejected, Returned, Overdue
│   │   │   ├── ReturnRequestStatus.cs     # Pending, Confirmed, Rejected
│   │   │   ├── TransactionType.cs         # Borrow, Return, BrokenReport, Consume
│   │   │   └── BrokenReportStatus.cs      # Pending, Confirmed, Rejected
│   │   ├── Consts/
│   │   │   ├── DeviceConsts.cs
│   │   │   ├── BorrowConsts.cs
│   │   │   └── TransactionConsts.cs
│   │   └── BaseProject.MachineTools.Domain.Shared.csproj
│   │
│   ├── BaseProject.MachineTools.Domain/
│   │   ├── BaseProjectMachineToolsDomainModule.cs
│   │   ├── Devices/
│   │   │   ├── Device.cs
│   │   │   ├── DeviceCategory.cs
│   │   │   ├── DeviceImage.cs
│   │   │   ├── IDeviceRepository.cs
│   │   │   └── DeviceManager.cs
│   │   ├── Borrowing/
│   │   │   ├── BorrowRequest.cs
│   │   │   ├── ReturnRequest.cs
│   │   │   ├── IBorrowRequestRepository.cs
│   │   │   ├── IReturnRequestRepository.cs
│   │   │   └── BorrowingManager.cs
│   │   ├── Transactions/
│   │   │   ├── DeviceTransaction.cs
│   │   │   └── IDeviceTransactionRepository.cs
│   │   ├── Employees/
│   │   │   ├── EmployeeReference.cs
│   │   │   └── IEmployeeReferenceRepository.cs
│   │   ├── Events/
│   │   │   ├── BorrowRequestCreatedEto.cs
│   │   │   ├── BorrowRequestApprovedEto.cs
│   │   │   ├── ReturnRequestCreatedEto.cs
│   │   │   ├── DeviceBrokenReportedEto.cs
│   │   │   └── DueDateReminderEto.cs
│   │   ├── Data/
│   │   │   ├── IMachineToolsDbSchemaMigrator.cs
│   │   │   └── MachineToolsDataSeedContributor.cs
│   │   └── BaseProject.MachineTools.Domain.csproj
│   │
│   ├── BaseProject.MachineTools.Application.Contracts/
│   │   ├── BaseProjectMachineToolsApplicationContractsModule.cs
│   │   ├── Devices/
│   │   │   ├── IDeviceAppService.cs
│   │   │   ├── IDeviceCategoryAppService.cs
│   │   │   └── Dtos/
│   │   │       ├── DeviceDto.cs
│   │   │       ├── CreateDeviceDto.cs
│   │   │       ├── UpdateDeviceDto.cs
│   │   │       ├── DeviceCategoryDto.cs
│   │   │       ├── CreateDeviceCategoryDto.cs
│   │   │       ├── DeviceListFilterDto.cs
│   │   │       └── DeviceImageDto.cs
│   │   ├── Borrowing/
│   │   │   ├── IBorrowRequestAppService.cs
│   │   │   ├── IReturnRequestAppService.cs
│   │   │   └── Dtos/
│   │   │       ├── BorrowRequestDto.cs
│   │   │       ├── CreateBorrowRequestDto.cs
│   │   │       ├── ApproveBorrowRequestDto.cs
│   │   │       ├── ReturnRequestDto.cs
│   │   │       ├── CreateReturnRequestDto.cs
│   │   │       ├── ConfirmReturnDto.cs
│   │   │       ├── BrokenReportDto.cs
│   │   │       └── CreateBrokenReportDto.cs
│   │   ├── Transactions/
│   │   │   ├── IDeviceTransactionAppService.cs
│   │   │   └── Dtos/
│   │   │       ├── DeviceTransactionDto.cs
│   │   │       └── TransactionFilterDto.cs
│   │   ├── Dashboard/
│   │   │   ├── IDashboardAppService.cs
│   │   │   └── Dtos/
│   │   │       └── DashboardDto.cs
│   │   ├── Notifications/
│   │   │   ├── INotificationAppService.cs
│   │   │   └── Dtos/
│   │   │       └── NotificationDto.cs
│   │   ├── Permissions/
│   │   │   ├── MachineToolsPermissions.cs
│   │   │   └── MachineToolsPermissionDefinitionProvider.cs
│   │   └── BaseProject.MachineTools.Application.Contracts.csproj
│   │
│   ├── BaseProject.MachineTools.Application/
│   │   ├── BaseProjectMachineToolsApplicationModule.cs
│   │   ├── BaseProjectMachineToolsApplicationAutoMapperProfile.cs
│   │   ├── Devices/
│   │   │   ├── DeviceAppService.cs
│   │   │   └── DeviceCategoryAppService.cs
│   │   ├── Borrowing/
│   │   │   ├── BorrowRequestAppService.cs
│   │   │   └── ReturnRequestAppService.cs
│   │   ├── Transactions/
│   │   │   └── DeviceTransactionAppService.cs
│   │   ├── Dashboard/
│   │   │   └── DashboardAppService.cs
│   │   ├── Notifications/
│   │   │   └── NotificationAppService.cs
│   │   ├── BackgroundJobs/
│   │   │   └── DueDateReminderJob.cs
│   │   └── BaseProject.MachineTools.Application.csproj
│   │
│   ├── BaseProject.MachineTools.EntityFrameworkCore/
│   │   ├── BaseProjectMachineToolsEntityFrameworkCoreModule.cs
│   │   ├── EntityFrameworkCore/
│   │   │   ├── MachineToolsDbContext.cs
│   │   │   ├── MachineToolsDbContextFactory.cs
│   │   │   ├── EntityTypeConfigurations/
│   │   │   │   ├── DeviceConfiguration.cs
│   │   │   │   ├── DeviceCategoryConfiguration.cs
│   │   │   │   ├── DeviceImageConfiguration.cs
│   │   │   │   ├── BorrowRequestConfiguration.cs
│   │   │   │   ├── ReturnRequestConfiguration.cs
│   │   │   │   ├── DeviceTransactionConfiguration.cs
│   │   │   │   └── EmployeeReferenceConfiguration.cs
│   │   │   └── Repositories/
│   │   │       ├── DeviceRepository.cs
│   │   │       ├── BorrowRequestRepository.cs
│   │   │       ├── ReturnRequestRepository.cs
│   │   │       └── DeviceTransactionRepository.cs
│   │   ├── Migrations/
│   │   └── BaseProject.MachineTools.EntityFrameworkCore.csproj
│   │
│   └── BaseProject.MachineTools.HttpApi.Host/
│       ├── BaseProjectMachineToolsHttpApiHostModule.cs
│       ├── Controllers/
│       │   ├── DeviceController.cs
│       │   ├── DeviceCategoryController.cs
│       │   ├── BorrowRequestController.cs
│       │   ├── ReturnRequestController.cs
│       │   ├── DeviceTransactionController.cs
│       │   ├── DashboardController.cs
│       │   └── NotificationController.cs
│       ├── Hubs/
│       │   └── NotificationHub.cs
│       ├── Properties/
│       │   └── launchSettings.json
│       ├── wwwroot/
│       │   └── uploads/      # Image storage
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Program.cs
│       └── BaseProject.MachineTools.HttpApi.Host.csproj
│
├── test/
│   ├── BaseProject.MachineTools.Domain.Tests/
│   ├── BaseProject.MachineTools.Application.Tests/
│   └── BaseProject.MachineTools.EntityFrameworkCore.Tests/
│
├── BaseProject.MachineTools.sln
├── common.props
├── Directory.Build.props
├── .gitignore
└── README.md
```

---

## 3. Database Design

### ER Diagram

```
┌─────────────────────────┐
│    DeviceCategories      │
├─────────────────────────┤
│ Id (Guid) PK             │
│ Name (string)            │
│ Description (string?)    │
│ IsActive (bool)          │
│ CreationTime             │
│ LastModificationTime     │
└────────────┬─────────────┘
             │ 1:N
             ▼
┌──────────────────────────┐       ┌──────────────────────────┐
│        Devices            │       │     DeviceImages          │
├──────────────────────────┤       ├──────────────────────────┤
│ Id (Guid) PK              │──1:N─▶│ Id (Guid) PK             │
│ CategoryId (Guid) FK      │       │ DeviceId (Guid?) FK       │
│ Name (string)             │       │ BorrowRequestId (Guid?)FK │
│ Code (string) UNIQUE      │       │ ReturnRequestId (Guid?)FK │
│ Description (string?)     │       │ ImageUrl (string)         │
│ DeviceType (enum)         │       │ ImageType (string)        │
│ TotalQuantity (int)       │       │ Description (string?)     │
│ AvailableQuantity (int)   │       │ CreationTime              │
│ Status (enum)             │       └──────────────────────────┘
│ Location (string?)        │
│ SerialNumber (string?)    │
│ ImageUrl (string?)        │
│ Notes (string?)           │
│ CreationTime              │
│ LastModificationTime      │
│ IsDeleted (bool)          │
└───────┬──────────────────┘
        │ 1:N
        ▼
┌───────────────────────────┐       ┌──────────────────────────┐
│      BorrowRequests        │       │    EmployeeReferences     │
├───────────────────────────┤       ├──────────────────────────┤
│ Id (Guid) PK               │       │ Id (Guid) PK             │
│ DeviceId (Guid) FK         │◀──FK──│ UserId (Guid) UNIQUE     │
│ EmployeeId (Guid) FK ─────│───────▶│ FullName (string)        │
│ Quantity (int)             │       │ Email (string?)          │
│ BorrowDate (DateTime)      │       │ PhoneNumber (string?)    │
│ ExpectedReturnDate (DateTime)│     │ EmployeeCode (string?)   │
│ ActualReturnDate (DateTime?)│      │ Department (string?)     │
│ Status (enum)              │       │ IsActive (bool)          │
│ Purpose (string?)          │       │ LastSyncTime (DateTime)  │
│ Notes (string?)            │       │ CreationTime             │
│ ApprovedBy (Guid?)         │       └──────────────────────────┘
│ ApprovedDate (DateTime?)   │
│ RejectionReason (string?)  │
│ CreationTime               │
│ LastModificationTime       │
└───────┬───────────────────┘
        │ 1:N
        ▼
┌───────────────────────────┐
│      ReturnRequests        │
├───────────────────────────┤
│ Id (Guid) PK               │
│ BorrowRequestId (Guid) FK  │
│ DeviceId (Guid) FK         │
│ EmployeeId (Guid) FK       │
│ Quantity (int)             │
│ ReturnDate (DateTime)      │
│ Status (enum)              │
│ Condition (string?)        │
│ IsBroken (bool)            │
│ BrokenDescription (string?)│
│ ConfirmedBy (Guid?)        │
│ ConfirmedDate (DateTime?)  │
│ RejectionReason (string?)  │
│ Notes (string?)            │
│ CreationTime               │
│ LastModificationTime       │
└───────────────────────────┘

┌───────────────────────────┐
│   DeviceTransactions       │
├───────────────────────────┤
│ Id (Guid) PK               │
│ DeviceId (Guid) FK         │
│ EmployeeId (Guid) FK       │
│ BorrowRequestId (Guid?) FK │
│ ReturnRequestId (Guid?) FK │
│ TransactionType (enum)     │
│ Quantity (int)             │
│ TransactionDate (DateTime) │
│ Notes (string?)            │
│ PerformedBy (Guid)         │
│ CreationTime               │
└───────────────────────────┘
```

### Tables Detail

#### DeviceCategories
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| Name | string(128) | Required, Unique | Category name |
| Description | string(512) | Nullable | Description |
| IsActive | bool | Default: true | Is category active |
| CreationTime | DateTime | Auto | Created timestamp |
| LastModificationTime | DateTime? | Auto | Updated timestamp |

#### Devices
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| CategoryId | Guid | FK → DeviceCategories | Category reference |
| Name | string(256) | Required | Device name |
| Code | string(32) | Required, Unique | Device code (e.g., TOOL-001) |
| Description | string(1024) | Nullable | Description |
| DeviceType | enum | Required | Tool / Consumable |
| TotalQuantity | int | Required, Min: 0 | Total quantity in system |
| AvailableQuantity | int | Required, Min: 0 | Currently available |
| Status | enum | Required | Available/InUse/Broken/Retired |
| Location | string(256) | Nullable | Storage location |
| SerialNumber | string(128) | Nullable | Serial number |
| ImageUrl | string(512) | Nullable | Primary image URL |
| Notes | string(1024) | Nullable | Additional notes |
| CreationTime | DateTime | Auto | Created timestamp |
| LastModificationTime | DateTime? | Auto | Updated timestamp |
| IsDeleted | bool | Default: false | Soft delete |

#### BorrowRequests
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| DeviceId | Guid | FK → Devices | Device being borrowed |
| EmployeeId | Guid | FK → EmployeeReferences | Employee borrowing |
| Quantity | int | Required, Min: 1 | Quantity requested |
| BorrowDate | DateTime | Required | Date of borrow |
| ExpectedReturnDate | DateTime | Required (for Tools) | Expected return date |
| ActualReturnDate | DateTime? | Nullable | Actual return date |
| Status | enum | Required | Pending/Approved/Rejected/Returned/Overdue |
| Purpose | string(512) | Nullable | Purpose of borrowing |
| Notes | string(1024) | Nullable | Additional notes |
| ApprovedBy | Guid? | Nullable | Admin who approved |
| ApprovedDate | DateTime? | Nullable | Approval date |
| RejectionReason | string(512) | Nullable | Reason for rejection |
| CreationTime | DateTime | Auto | Created timestamp |
| LastModificationTime | DateTime? | Auto | Updated timestamp |

#### ReturnRequests
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| BorrowRequestId | Guid | FK → BorrowRequests | Related borrow request |
| DeviceId | Guid | FK → Devices | Device being returned |
| EmployeeId | Guid | FK → EmployeeReferences | Employee returning |
| Quantity | int | Required, Min: 1 | Quantity returned |
| ReturnDate | DateTime | Required | Date of return |
| Status | enum | Required | Pending/Confirmed/Rejected |
| Condition | string(256) | Nullable | Device condition notes |
| IsBroken | bool | Default: false | Is device reported broken |
| BrokenDescription | string(1024) | Nullable | Broken details |
| ConfirmedBy | Guid? | Nullable | Admin who confirmed |
| ConfirmedDate | DateTime? | Nullable | Confirmation date |
| RejectionReason | string(512) | Nullable | Reason for rejection |
| Notes | string(1024) | Nullable | Additional notes |
| CreationTime | DateTime | Auto | Created timestamp |
| LastModificationTime | DateTime? | Auto | Updated timestamp |

#### DeviceTransactions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| DeviceId | Guid | FK → Devices | Device in transaction |
| EmployeeId | Guid | FK → EmployeeReferences | Employee involved |
| BorrowRequestId | Guid? | FK → BorrowRequests | Related borrow request |
| ReturnRequestId | Guid? | FK → ReturnRequests | Related return request |
| TransactionType | enum | Required | Borrow/Return/BrokenReport/Consume |
| Quantity | int | Required | Quantity in transaction |
| TransactionDate | DateTime | Required | Date of transaction |
| Notes | string(1024) | Nullable | Notes |
| PerformedBy | Guid | Required | User who performed |
| CreationTime | DateTime | Auto | Created timestamp |

#### DeviceImages
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| DeviceId | Guid? | FK → Devices | Device reference |
| BorrowRequestId | Guid? | FK → BorrowRequests | Borrow proof |
| ReturnRequestId | Guid? | FK → ReturnRequests | Return proof |
| ImageUrl | string(512) | Required | Image file URL |
| ImageType | string(64) | Required | "BorrowProof", "ReturnProof", "BrokenProof", "DevicePhoto" |
| Description | string(256) | Nullable | Description |
| CreationTime | DateTime | Auto | Created timestamp |

#### EmployeeReferences
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | Guid | PK | Primary key |
| UserId | Guid | Required, Unique | User Management UserId |
| FullName | string(128) | Required | Cached full name |
| Email | string(256) | Nullable | Cached email |
| PhoneNumber | string(16) | Nullable | Cached phone |
| EmployeeCode | string(32) | Nullable | Employee code |
| Department | string(128) | Nullable | Department |
| IsActive | bool | Default: true | Active status |
| LastSyncTime | DateTime | Required | Last synced from User Management |
| CreationTime | DateTime | Auto | Created timestamp |

---

## 4. Entity Definitions

### Device
```csharp
public class Device : FullAuditedAggregateRoot<Guid>
{
    public Guid CategoryId { get; private set; }
    public string Name { get; private set; }
    public string Code { get; private set; }
    public string? Description { get; set; }
    public DeviceType DeviceType { get; private set; }
    public int TotalQuantity { get; private set; }
    public int AvailableQuantity { get; private set; }
    public DeviceStatus Status { get; private set; }
    public string? Location { get; set; }
    public string? SerialNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public DeviceCategory Category { get; set; }
    public ICollection<DeviceImage> Images { get; set; }
    public ICollection<BorrowRequest> BorrowRequests { get; set; }

    // Domain methods
    public void Borrow(int quantity) { ... }
    public void Return(int quantity) { ... }
    public void MarkBroken(int quantity) { ... }
    public void Consume(int quantity) { ... }
    public void UpdateQuantity(int newTotal) { ... }
}
```

### BorrowRequest
```csharp
public class BorrowRequest : FullAuditedAggregateRoot<Guid>
{
    public Guid DeviceId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public int Quantity { get; private set; }
    public DateTime BorrowDate { get; private set; }
    public DateTime ExpectedReturnDate { get; private set; }
    public DateTime? ActualReturnDate { get; private set; }
    public BorrowRequestStatus Status { get; private set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? RejectionReason { get; private set; }

    // Navigation
    public Device Device { get; set; }
    public EmployeeReference Employee { get; set; }
    public ICollection<ReturnRequest> ReturnRequests { get; set; }
    public ICollection<DeviceImage> Images { get; set; }

    // Domain methods
    public void Approve(Guid adminId) { ... }
    public void Reject(Guid adminId, string reason) { ... }
    public void MarkReturned(DateTime returnDate) { ... }
    public void MarkOverdue() { ... }
}
```

### ReturnRequest
```csharp
public class ReturnRequest : FullAuditedAggregateRoot<Guid>
{
    public Guid BorrowRequestId { get; private set; }
    public Guid DeviceId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public int Quantity { get; private set; }
    public DateTime ReturnDate { get; private set; }
    public ReturnRequestStatus Status { get; private set; }
    public string? Condition { get; set; }
    public bool IsBroken { get; private set; }
    public string? BrokenDescription { get; set; }
    public Guid? ConfirmedBy { get; private set; }
    public DateTime? ConfirmedDate { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? Notes { get; set; }

    // Navigation
    public BorrowRequest BorrowRequest { get; set; }
    public Device Device { get; set; }
    public EmployeeReference Employee { get; set; }
    public ICollection<DeviceImage> Images { get; set; }

    // Domain methods
    public void Confirm(Guid adminId) { ... }
    public void Reject(Guid adminId, string reason) { ... }
    public void MarkAsBroken(string description) { ... }
}
```

---

## 5. API Endpoints

### Devices
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/devices` | Admin, Employee | List devices (paged, filtered) |
| GET | `/api/devices/{id}` | Admin, Employee | Get device detail |
| POST | `/api/devices` | Admin | Create device |
| PUT | `/api/devices/{id}` | Admin | Update device |
| DELETE | `/api/devices/{id}` | Admin | Soft delete device |
| GET | `/api/devices/available` | Employee | List available devices |
| PUT | `/api/devices/{id}/quantity` | Admin | Update quantity |
| POST | `/api/devices/{id}/images` | Admin | Upload device image |

### Device Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/device-categories` | Admin, Employee | List categories |
| GET | `/api/device-categories/{id}` | Admin, Employee | Get category |
| POST | `/api/device-categories` | Admin | Create category |
| PUT | `/api/device-categories/{id}` | Admin | Update category |
| DELETE | `/api/device-categories/{id}` | Admin | Delete category |

### Borrow Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/borrow-requests` | Admin | List all borrow requests |
| GET | `/api/borrow-requests/my` | Employee | List my borrow requests |
| GET | `/api/borrow-requests/{id}` | Admin, Employee | Get borrow request detail |
| POST | `/api/borrow-requests` | Employee | Create borrow request |
| PUT | `/api/borrow-requests/{id}/approve` | Admin | Approve borrow request |
| PUT | `/api/borrow-requests/{id}/reject` | Admin | Reject borrow request |
| GET | `/api/borrow-requests/pending` | Admin | List pending requests |
| GET | `/api/borrow-requests/overdue` | Admin | List overdue requests |
| POST | `/api/borrow-requests/{id}/images` | Employee | Upload borrow proof images |

### Return Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/return-requests` | Admin | List all return requests |
| GET | `/api/return-requests/my` | Employee | List my return requests |
| GET | `/api/return-requests/{id}` | Admin, Employee | Get return request detail |
| POST | `/api/return-requests` | Employee | Submit return request |
| PUT | `/api/return-requests/{id}/confirm` | Admin | Confirm return |
| PUT | `/api/return-requests/{id}/reject` | Admin | Reject return |
| POST | `/api/return-requests/{id}/broken-report` | Employee | Report device as broken |
| PUT | `/api/return-requests/{id}/confirm-broken` | Admin | Confirm broken report |
| POST | `/api/return-requests/{id}/images` | Employee | Upload return/broken proof |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/transactions` | Admin | List all transactions |
| GET | `/api/transactions/device/{deviceId}` | Admin | Device transaction history |
| GET | `/api/transactions/employee/{employeeId}` | Admin | Employee transaction history |
| GET | `/api/transactions/my` | Employee | My transaction history |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | Admin | Dashboard statistics |
| GET | `/api/dashboard/recent-activities` | Admin | Recent activities |
| GET | `/api/dashboard/overdue-summary` | Admin | Overdue items summary |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | All | List notifications |
| PUT | `/api/notifications/{id}/read` | All | Mark as read |
| PUT | `/api/notifications/read-all` | All | Mark all as read |

---

## 6. Authentication Flow

This service **does not** issue tokens. It **validates** JWT tokens issued by the User Management service.

### JWT Validation Flow
```
Client                    Machine Tools API           User Management API
  │                              │                           │
  │──Request + Bearer JWT────────▶                           │
  │                              │                           │
  │                              │──(first time) Fetch JWKS──▶
  │                              │◀──Public signing keys──────│
  │                              │                           │
  │                              │──Validate JWT locally─────│
  │                              │  (signature + claims)     │
  │                              │                           │
  │                              │──Extract user claims──────│
  │                              │  (sub, role, name, etc.)  │
  │                              │                           │
  │                              │──Sync EmployeeReference───│
  │                              │  (if not exists)          │
  │                              │                           │
  │◀─────API Response────────────│                           │
```

### JWT Configuration
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://localhost:44301"; // User Management
        options.Audience = "base-project";
        options.RequireHttpsMetadata = false; // Dev only
    });
```

---

## 7. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | .NET 8 LTS + ABP 8.x | Consistent with User Management |
| Database | PostgreSQL 16 | Separate DB from User Management |
| ORM | EF Core 8 | ABP default |
| Cache | Redis + In-memory fallback | Device availability caching |
| Event Bus | ABP Local Events (v1) | Upgrade to RabbitMQ later |
| File Storage | Local disk (v1) | ABP BlobStoring for future cloud |
| Real-time | SignalR | Notification push to clients |
| Background Jobs | ABP Background Jobs | Due date reminders |
| Image Upload | Multipart form upload | Standard approach |
| Pagination | ABP PagedResultDto | Consistent paging |
| Validation | FluentValidation | ABP integration |
| Logging | Serilog | Consistent with User Management |

### Database Connection
```
Host=localhost;Port=5433;Database=machinetools;Username=admin;Password=admin
```

### Ports
- Machine Tools API: `https://localhost:44302` (HTTPS), `http://localhost:5002` (HTTP)

---

## 8. Business Rules

### Borrowing Rules
1. Only employees can create borrow requests
2. Available quantity must be sufficient for the requested amount
3. Tools require an expected return date; consumables do not
4. Admin must approve borrow requests before tools are released
5. Once approved, `AvailableQuantity` is decremented
6. If rejected, no quantity change occurs

### Return Rules
1. Only the borrowing employee can create a return request
2. Return quantity cannot exceed borrowed quantity
3. Admin must confirm returns
4. On confirmation, `AvailableQuantity` is incremented
5. If device is reported broken:
   - Admin must confirm broken status
   - Broken devices are NOT returned to available pool
   - `TotalQuantity` may need adjustment

### Consumable Rules
1. Consumables are "borrowed" but never returned
2. Approved consumable requests permanently reduce `AvailableQuantity` and `TotalQuantity`
3. No expected return date for consumables

### Overdue Rules
1. Background job checks borrow requests daily
2. If `ExpectedReturnDate < Today` and status is `Approved`, mark as `Overdue`
3. Send notification to employee and admin

---

## 9. Implementation Steps

### Phase 1: Project Setup
1. Create ABP solution manually with layered architecture
2. Configure solution structure (Domain.Shared, Domain, Application.Contracts, Application, EF Core, HttpApi.Host)
3. Add NuGet packages
4. Configure `Directory.Build.props`

### Phase 2: Domain Layer
5. Create all enums in Domain.Shared
6. Create constants in Domain.Shared
7. Create `Device` entity with domain methods
8. Create `DeviceCategory` entity
9. Create `BorrowRequest` entity with domain methods
10. Create `ReturnRequest` entity with domain methods
11. Create `DeviceTransaction` entity
12. Create `DeviceImage` entity
13. Create `EmployeeReference` entity
14. Define repository interfaces
15. Create `DeviceManager` domain service
16. Create `BorrowingManager` domain service
17. Define domain events

### Phase 3: Application Layer
18. Define all DTOs in Application.Contracts
19. Define service interfaces
20. Define permissions
21. Implement `DeviceAppService`
22. Implement `DeviceCategoryAppService`
23. Implement `BorrowRequestAppService`
24. Implement `ReturnRequestAppService`
25. Implement `DeviceTransactionAppService`
26. Implement `DashboardAppService`
27. Implement `NotificationAppService`
28. Create AutoMapper profiles
29. Create `DueDateReminderJob` background job

### Phase 4: Infrastructure Layer
30. Configure `MachineToolsDbContext`
31. Add all entity type configurations
32. Implement repositories
33. Configure PostgreSQL
34. Create initial migration
35. Create data seed (sample categories, devices)

### Phase 5: API Layer
36. Create API controllers
37. Configure JWT validation (from User Management)
38. Configure Swagger with JWT auth
39. Configure CORS
40. Configure file upload middleware
41. Configure SignalR hub

### Phase 6: Integration
42. Configure EmployeeReference sync from JWT claims
43. Configure health checks
44. Test all API endpoints
45. Test borrow → approve → return flow
46. Test broken device flow
47. Test consumable flow

---

## 11. User Management Integration (Added 2026-02-28)

### Architecture Decision
The Machine Tools server does NOT manage users directly. It relies entirely on the **User Management Service** (`localhost:44301`) for authentication and user CRUD. The integration works as follows:

1. **JWT Validation**: Machine Tools validates JWT tokens issued by User Management using a shared symmetric key (`BaseProject-UserManagement-SecretKey-Min32Chars!!`)
2. **EmployeeReference Sync**: When a user first makes a request to Machine Tools, an `EmployeeReference` record is created/updated from JWT claims (UserId, FullName, Email, Phone, EmployeeCode, Department)
3. **Role-Based Authorization**: Controllers use `[Authorize(Roles = "Admin")]` for admin-only operations (device CRUD, approval/rejection, dashboard, transaction history)

### User Management API Consumed (from User Management Service)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login/phone` | Phone + password login |
| POST | `/api/auth/login/google` | Google OAuth2 login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh-token` | Token refresh (NOTE: path is `/refresh-token`, NOT `/refresh`) |
| GET | `/api/users` | List all users (Admin) |
| GET | `/api/users/{id}` | Get user details |
| POST | `/api/users` | Create user (Admin) |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/users/{id}/roles` | Get user roles |
| PUT | `/api/users/{id}/roles` | Assign roles to user |
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update profile |

### Role Definitions
| Role | Permissions |
|------|-------------|
| **Admin** | Full access: device CRUD, category CRUD, approve/reject borrows, confirm returns, view all transactions, dashboard, user management (via User Management API) |
| **Employee** | Limited: view devices, create borrow requests, view own borrows/returns/transactions, manage own profile |
