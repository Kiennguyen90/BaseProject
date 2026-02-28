# Machine Tools Management — Web Admin Plan

## 1. Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   React Web Admin (SPA)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │                    Pages / Views                    │ │
│  │  Dashboard | Devices | Borrows | Returns | Users   │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │                   Components                       │ │
│  │  Tables | Forms | Modals | Charts | Layout         │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │                State Management                    │ │
│  │  React Context + React Query (TanStack Query)      │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │                   API Layer                        │ │
│  │  Axios Instance → Interceptors → API Services      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────┬────────────────┬──────────────────┘
                      │                │
                      ▼                ▼
          ┌──────────────────┐  ┌─────────────────────┐
          │ User Management  │  │ Machine Tools API   │
          │ API (Auth)       │  │ (Data)              │
          │ :44301           │  │ :44302              │
          └──────────────────┘  └─────────────────────┘
```

### Design Principles
- **Component-based**: Reusable UI components
- **Type-safe**: TypeScript throughout
- **API-first**: Clean API service layer with Axios
- **Responsive**: Admin dashboard works on desktop and tablet
- **Modular**: Feature-based folder structure
- **Role-based UI**: Show/hide based on admin permissions

---

## 2. Folder Structure

```
base-project-machine-tools-web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── api/
│   │   ├── axiosInstance.ts          # Axios config, interceptors, base URL
│   │   ├── authApi.ts               # Auth endpoints (login, refresh)
│   │   ├── deviceApi.ts             # Device CRUD endpoints
│   │   ├── deviceCategoryApi.ts     # Category endpoints
│   │   ├── borrowRequestApi.ts      # Borrow request endpoints
│   │   ├── returnRequestApi.ts      # Return request endpoints
│   │   ├── transactionApi.ts        # Transaction history endpoints
│   │   ├── dashboardApi.ts          # Dashboard stats endpoints
│   │   ├── notificationApi.ts       # Notification endpoints
│   │   └── userApi.ts               # Employee listing endpoints
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── global.css
│   │       └── variables.css
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Table/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── DataTable.module.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── ConfirmModal.tsx
│   │   │   ├── Form/
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   ├── FormDatePicker.tsx
│   │   │   │   └── FormImageUpload.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   └── layout/
│   │       ├── MainLayout.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Breadcrumb.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx            # Auth state, user info, tokens
│   │   ├── NotificationContext.tsx    # Real-time notifications
│   │   └── ThemeContext.tsx           # Dark/light theme
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth hook
│   │   ├── useDevices.ts             # Device queries
│   │   ├── useBorrowRequests.ts      # Borrow request queries
│   │   ├── useReturnRequests.ts      # Return request queries
│   │   ├── useTransactions.ts        # Transaction queries
│   │   ├── useDashboard.ts           # Dashboard data
│   │   ├── useNotifications.ts       # Notification hook
│   │   ├── usePagination.ts          # Pagination hook
│   │   └── useDebounce.ts            # Debounce hook
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── LoginPage.module.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DashboardPage.module.css
│   │   │   ├── components/
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── RecentActivities.tsx
│   │   │   │   ├── OverdueChart.tsx
│   │   │   │   ├── DeviceUsageChart.tsx
│   │   │   │   └── BorrowTrendChart.tsx
│   │   │
│   │   ├── devices/
│   │   │   ├── DeviceListPage.tsx
│   │   │   ├── DeviceDetailPage.tsx
│   │   │   ├── DeviceCreatePage.tsx
│   │   │   ├── DeviceEditPage.tsx
│   │   │   ├── DeviceQuantityPage.tsx
│   │   │   └── components/
│   │   │       ├── DeviceTable.tsx
│   │   │       ├── DeviceForm.tsx
│   │   │       ├── DeviceFilters.tsx
│   │   │       └── DeviceQuantityModal.tsx
│   │   │
│   │   ├── categories/
│   │   │   ├── CategoryListPage.tsx
│   │   │   └── components/
│   │   │       ├── CategoryTable.tsx
│   │   │       └── CategoryForm.tsx
│   │   │
│   │   ├── borrow-requests/
│   │   │   ├── BorrowRequestListPage.tsx
│   │   │   ├── BorrowRequestDetailPage.tsx
│   │   │   ├── PendingRequestsPage.tsx
│   │   │   ├── OverdueRequestsPage.tsx
│   │   │   └── components/
│   │   │       ├── BorrowRequestTable.tsx
│   │   │       ├── RequestApprovalModal.tsx
│   │   │       ├── RequestRejectionModal.tsx
│   │   │       └── BorrowRequestFilters.tsx
│   │   │
│   │   ├── return-requests/
│   │   │   ├── ReturnRequestListPage.tsx
│   │   │   ├── ReturnRequestDetailPage.tsx
│   │   │   ├── BrokenReportsPage.tsx
│   │   │   └── components/
│   │   │       ├── ReturnRequestTable.tsx
│   │   │       ├── ConfirmReturnModal.tsx
│   │   │       ├── BrokenReportDetail.tsx
│   │   │       └── ReturnRequestFilters.tsx
│   │   │
│   │   ├── transactions/
│   │   │   ├── TransactionHistoryPage.tsx
│   │   │   └── components/
│   │   │       ├── TransactionTable.tsx
│   │   │       └── TransactionFilters.tsx
│   │   │
│   │   ├── employees/
│   │   │   ├── EmployeeListPage.tsx
│   │   │   ├── EmployeeDetailPage.tsx
│   │   │   └── components/
│   │   │       ├── EmployeeTable.tsx
│   │   │       └── EmployeeBorrowHistory.tsx
│   │   │
│   │   └── notifications/
│   │       └── NotificationListPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx              # Route definitions
│   │   ├── PrivateRoute.tsx           # Auth guard
│   │   └── routePaths.ts             # Route constants
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── device.types.ts
│   │   ├── borrowRequest.types.ts
│   │   ├── returnRequest.types.ts
│   │   ├── transaction.types.ts
│   │   ├── employee.types.ts
│   │   ├── notification.types.ts
│   │   ├── dashboard.types.ts
│   │   ├── common.types.ts           # Paged results, API responses
│   │   └── enums.ts                  # DeviceType, Status enums
│   │
│   ├── utils/
│   │   ├── constants.ts              # App constants
│   │   ├── dateUtils.ts              # Date formatting
│   │   ├── formatUtils.ts            # Number, currency formatting
│   │   ├── storageUtils.ts           # LocalStorage helpers
│   │   ├── validationUtils.ts        # Form validation helpers
│   │   └── notificationUtils.ts      # Toast notifications
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
│
├── .env
├── .env.development
├── .env.production
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── vite.config.ts
```

---

## 3. Database Design

N/A — The web admin app does not have its own database. All data is fetched from:
- **User Management API** — Authentication, user info
- **Machine Tools API** — All device and borrow data

---

## 4. Entity Definitions (TypeScript Types)

### Common Types
```typescript
// common.types.ts
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

export interface PagedRequestDto {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Device Types
```typescript
// device.types.ts
export enum DeviceType {
  Tool = 0,
  Consumable = 1,
}

export enum DeviceStatus {
  Available = 0,
  InUse = 1,
  Broken = 2,
  Retired = 3,
}

export interface DeviceDto {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  code: string;
  description?: string;
  deviceType: DeviceType;
  totalQuantity: number;
  availableQuantity: number;
  status: DeviceStatus;
  location?: string;
  serialNumber?: string;
  imageUrl?: string;
  notes?: string;
  creationTime: string;
}

export interface CreateDeviceDto {
  categoryId: string;
  name: string;
  code: string;
  description?: string;
  deviceType: DeviceType;
  totalQuantity: number;
  location?: string;
  serialNumber?: string;
  notes?: string;
}

export interface UpdateDeviceDto extends Partial<CreateDeviceDto> {}

export interface DeviceFilterDto extends PagedRequestDto {
  keyword?: string;
  categoryId?: string;
  deviceType?: DeviceType;
  status?: DeviceStatus;
}
```

### Borrow Request Types
```typescript
// borrowRequest.types.ts
export enum BorrowRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Returned = 3,
  Overdue = 4,
}

export interface BorrowRequestDto {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowRequestStatus;
  purpose?: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  images: DeviceImageDto[];
  creationTime: string;
}

export interface ApproveBorrowRequestDto {
  notes?: string;
}

export interface RejectBorrowRequestDto {
  reason: string;
}
```

### Return Request Types
```typescript
// returnRequest.types.ts
export enum ReturnRequestStatus {
  Pending = 0,
  Confirmed = 1,
  Rejected = 2,
}

export interface ReturnRequestDto {
  id: string;
  borrowRequestId: string;
  deviceId: string;
  deviceName: string;
  employeeId: string;
  employeeName: string;
  quantity: number;
  returnDate: string;
  status: ReturnRequestStatus;
  condition?: string;
  isBroken: boolean;
  brokenDescription?: string;
  confirmedBy?: string;
  confirmedDate?: string;
  rejectionReason?: string;
  images: DeviceImageDto[];
  creationTime: string;
}
```

---

## 5. API Endpoints (Consumed)

### Authentication (User Management API - :44301)
| Action | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/api/auth/login/phone` |
| Refresh Token | POST | `/api/auth/refresh-token` |
| Get Profile | GET | `/api/profile` |

### Devices (Machine Tools API - :44302)
| Action | Method | Endpoint |
|--------|--------|----------|
| List | GET | `/api/devices` |
| Get | GET | `/api/devices/{id}` |
| Create | POST | `/api/devices` |
| Update | PUT | `/api/devices/{id}` |
| Delete | DELETE | `/api/devices/{id}` |
| Update Qty | PUT | `/api/devices/{id}/quantity` |
| Upload Image | POST | `/api/devices/{id}/images` |

### Categories (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| List | GET | `/api/device-categories` |
| Create | POST | `/api/device-categories` |
| Update | PUT | `/api/device-categories/{id}` |
| Delete | DELETE | `/api/device-categories/{id}` |

### Borrow Requests (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| List All | GET | `/api/borrow-requests` |
| Get Detail | GET | `/api/borrow-requests/{id}` |
| Approve | PUT | `/api/borrow-requests/{id}/approve` |
| Reject | PUT | `/api/borrow-requests/{id}/reject` |
| Pending | GET | `/api/borrow-requests/pending` |
| Overdue | GET | `/api/borrow-requests/overdue` |

### Return Requests (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| List All | GET | `/api/return-requests` |
| Get Detail | GET | `/api/return-requests/{id}` |
| Confirm | PUT | `/api/return-requests/{id}/confirm` |
| Reject | PUT | `/api/return-requests/{id}/reject` |
| Confirm Broken | PUT | `/api/return-requests/{id}/confirm-broken` |

### Transactions (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| List All | GET | `/api/transactions` |
| By Device | GET | `/api/transactions/device/{deviceId}` |
| By Employee | GET | `/api/transactions/employee/{employeeId}` |

### Dashboard (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| Stats | GET | `/api/dashboard/stats` |
| Recent | GET | `/api/dashboard/recent-activities` |
| Overdue | GET | `/api/dashboard/overdue-summary` |

---

## 6. Authentication Flow

### Admin Login Flow
```
Admin User                   Web Admin App              User Management API
    │                              │                           │
    │──Enter phone + password─────▶│                           │
    │                              │──POST /api/auth/login/phone─▶
    │                              │  { phone, password }      │
    │                              │                           │
    │                              │◀──{ accessToken,          │
    │                              │     refreshToken }────────│
    │                              │                           │
    │                              │──Store tokens in          │
    │                              │  localStorage             │
    │                              │                           │
    │                              │──Check role claim         │
    │                              │  (must be "Admin")        │
    │                              │                           │
    │◀─────Redirect to Dashboard───│                           │
```

### Token Refresh Flow
```
Web Admin App                          User Management API
    │                                         │
    │──API call with expired token───────────▶│
    │◀─────401 Unauthorized──────────────────│
    │                                         │
    │──(Axios interceptor)                    │
    │──POST /api/auth/refresh-token──────────▶│
    │  { refreshToken }                       │
    │                                         │
    │◀──{ new accessToken, refreshToken }────│
    │                                         │
    │──Retry original request─────────────────▶│
    │◀─────200 OK───────────────────────────│
```

### Axios Interceptor (Token Handling)
```typescript
// axiosInstance.ts
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // If refresh fails, redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React 18 + TypeScript | Latest stable, type safety |
| Build Tool | Vite | Fast build, HMR, modern |
| Routing | React Router v6 | Standard React routing |
| HTTP Client | Axios | Interceptors, cancel tokens |
| State Management | React Query (TanStack Query) v5 | Server state, caching, refetch |
| Auth State | React Context | Simple, sufficient for auth |
| UI Library | Ant Design (antd) v5 | Enterprise admin components |
| Charts | Recharts | Simple React charting |
| Form Handling | React Hook Form + Zod | Performant forms, schema validation |
| Date Handling | dayjs | Lightweight, Ant Design compatible |
| CSS | CSS Modules + Ant Design Theme | Scoped styles, theming |
| Notifications | antd notification | Built-in with UI library |
| Real-time | SignalR (@microsoft/signalr) | Match backend hub |
| Linting | ESLint + Prettier | Code quality |
| Testing | Vitest + React Testing Library | Fast, aligned with Vite |

### Dev Server Port
- Web Admin Dev: `http://localhost:3000`

---

## 8. Pages Design

### 1. Login Page (`/login`)
- Phone number input
- Password input
- Login button
- Redirect to dashboard on success
- Error display for invalid credentials

### 2. Dashboard (`/`)
- **Stats Cards**: Total devices, Active borrows, Pending requests, Overdue items
- **Borrow Trend Chart**: Line chart showing borrows over time
- **Device Usage Chart**: Pie chart of device type distribution
- **Recent Activities**: Table of latest transactions
- **Overdue Alerts**: List of overdue borrow requests

### 3. Device Management (`/devices`)
- **Device List**: Searchable, filterable data table
  - Columns: Code, Name, Category, Type, Total Qty, Available Qty, Status, Actions
  - Filters: Category, Type, Status, Search
  - Actions: View, Edit, Delete, Manage Qty
- **Device Create** (`/devices/create`): Form with all device fields + image upload
- **Device Edit** (`/devices/:id/edit`): Pre-filled form
- **Device Detail** (`/devices/:id`): Full info + borrow history + images
- **Quantity Management**: Modal to adjust total/available quantity

### 4. Category Management (`/categories`)
- CRUD table for device categories
- Inline editing or modal form

### 5. Borrow Requests (`/borrow-requests`)
- **All Requests**: Full list with status filters
- **Pending Requests** (`/borrow-requests/pending`): Requests awaiting approval
  - Approve/Reject actions with modals
- **Overdue Requests** (`/borrow-requests/overdue`): Overdue items
- **Request Detail** (`/borrow-requests/:id`): Full details + images + timeline

### 6. Return Requests (`/return-requests`)
- **All Returns**: List with filters
- **Broken Reports** (`/return-requests/broken`): Items reported broken
  - Confirm/Reject broken status
- **Return Detail** (`/return-requests/:id`): Full details + proof images

### 7. Transaction History (`/transactions`)
- Comprehensive table of all transactions
- Filters: Date range, Device, Employee, Type
- Export capability (future)

### 8. Employee Management (`/employees`)
- List of employees (synced from User Management)
- **Employee Detail** (`/employees/:id`): Employee info + borrow history

### 9. Notifications (`/notifications`)
- List of system notifications
- Mark as read functionality

---

## 9. Implementation Steps

### Phase 1: Project Setup
1. Create React + TypeScript project with Vite: `npm create vite@latest`
2. Install dependencies:
   - `react-router-dom`, `axios`, `@tanstack/react-query`
   - `antd`, `@ant-design/icons`
   - `recharts`, `dayjs`
   - `react-hook-form`, `@hookform/resolvers`, `zod`
   - `@microsoft/signalr`
3. Configure TypeScript (`tsconfig.json`)
4. Configure Vite (`vite.config.ts`) with proxy
5. Setup ESLint + Prettier

### Phase 2: Foundation
6. Create folder structure
7. Setup Axios instance with interceptors
8. Create AuthContext and useAuth hook
9. Setup React Router with route definitions
10. Create MainLayout with Sidebar, Header
11. Create PrivateRoute component
12. Setup React Query provider

### Phase 3: Common Components
13. Create DataTable component (wrapping antd Table)
14. Create form components (FormInput, FormSelect, etc.)
15. Create Modal components
16. Create StatusBadge component
17. Create SearchBar and filter components
18. Create LoadingSpinner and ErrorBoundary

### Phase 4: API Layer
19. Create all API service files
20. Create TypeScript types/interfaces
21. Create custom hooks for data fetching (useDevices, useBorrowRequests, etc.)

### Phase 5: Pages - Core
22. Implement LoginPage
23. Implement DashboardPage with charts
24. Implement DeviceListPage
25. Implement DeviceCreatePage / DeviceEditPage
26. Implement DeviceDetailPage
27. Implement CategoryListPage

### Phase 6: Pages - Borrowing
28. Implement BorrowRequestListPage
29. Implement PendingRequestsPage with approve/reject
30. Implement OverdueRequestsPage
31. Implement BorrowRequestDetailPage

### Phase 7: Pages - Returns
32. Implement ReturnRequestListPage
33. Implement BrokenReportsPage
34. Implement ReturnRequestDetailPage

### Phase 8: Pages - Additional
35. Implement TransactionHistoryPage
36. Implement EmployeeListPage
37. Implement EmployeeDetailPage
38. Implement NotificationListPage

### Phase 9: Integration & Polish
39. Connect SignalR for real-time notifications
40. Add loading states and error handling
41. Add toast notifications for actions
42. Test all CRUD operations
43. Test approval workflows
44. Responsive design adjustments
45. Browser testing

---

## 10. Environment Configuration

### .env.development
```
VITE_USER_MANAGEMENT_API_URL=http://localhost:5001
VITE_MACHINE_TOOLS_API_URL=http://localhost:5002
VITE_APP_NAME=Machine Tools Admin
```

### .env.production
```
VITE_USER_MANAGEMENT_API_URL=https://api-auth.yourdomain.com
VITE_MACHINE_TOOLS_API_URL=https://api-tools.yourdomain.com
VITE_APP_NAME=Machine Tools Admin
```

---

## 11. User Management Integration (Added 2026-02-28)

### Overview
The Web Admin integrates with the **User Management Service** (`localhost:44301`) for user CRUD, role assignment, and profile management. The Machine Tools API (`localhost:44302`) does not expose user endpoints — all user operations are proxied through the auth API.

### New Files Added
| File | Purpose |
|------|---------|
| `src/types/user.types.ts` | User management DTOs: `UserListItem`, `CreateUserDto`, `UpdateUserDto`, `UserRoles` |
| `src/api/userApi.ts` | CRUD + role assignment calling `/api/users/*` on auth service |
| `src/hooks/useUsers.ts` | React Query hooks: `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useUserRoles`, `useSetUserRoles` |
| `src/pages/UserListPage.tsx` | Full CRUD table with create/edit modal, search, role assignment dialog, activate/deactivate |
| `src/pages/ProfilePage.tsx` | Current user profile view + edit |

### Updated Files
| File | Change |
|------|--------|
| `src/api/axiosInstance.ts` | Fix token refresh path from `/api/auth/refresh` to `/api/auth/refresh-token` |
| `src/routes/AppRoutes.tsx` | Add `/users` and `/profile` routes |
| `src/components/layout/MainLayout.tsx` | Add "Quản lý người dùng" menu item (Admin-only) |
| `src/pages/EmployeeListPage.tsx` | Replaced placeholder with functional employee list from Machine Tools API |

### Refresh Token Endpoint Fix
**Before:** `POST /api/auth/refresh` (404 — path does not exist on server)
**After:** `POST /api/auth/refresh-token` (matches `AuthController.cs`)

### Role-Based Access Control in Web
| Feature | Admin | Employee |
|---------|-------|----------|
| Dashboard | ✅ | ✅ (limited stats) |
| Device CRUD | ✅ | View only |
| Category CRUD | ✅ | View only |
| Borrow Requests | ✅ Approve/Reject | ✅ Create/View own |
| Return Requests | ✅ Confirm/Reject | ✅ Create/View own |
| Transaction History | ✅ All | ✅ Own only |
| User Management | ✅ | ❌ |
| Profile | ✅ | ✅ |
