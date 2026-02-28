# Machine Tools Management — Mobile App Plan

## 1. Architecture Overview

### High-Level Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                React Native Mobile App                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Screens (Pages)                       │ │
│  │  Login | Home | Devices | Borrow | Return | Profile     │ │
│  │  Admin: Requests | Approvals | History                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Components                            │ │
│  │  Cards | Lists | Forms | Camera | Modals | Navigation   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  State Management                        │ │
│  │  React Query + Context API + AsyncStorage                │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    API Layer                              │ │
│  │  Axios → Interceptors → API Services                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Native Modules                              │ │
│  │  Camera | Push Notifications | Image Picker              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────┬───────────────────────┬───────────────────┘
                   │                       │
                   ▼                       ▼
       ┌──────────────────┐     ┌─────────────────────┐
       │ User Management  │     │ Machine Tools API   │
       │ API (Auth)       │     │ (Data)              │
       │ :44301           │     │ :44302              │
       └──────────────────┘     └─────────────────────┘
```

### Design Principles
- **Cross-platform**: React Native for iOS and Android
- **Offline-aware**: Handle network failures gracefully
- **Camera-integrated**: Photo capture for borrow/return proof
- **Role-based navigation**: Different screens for Employee vs Admin
- **Push notifications**: Due date reminders and approval status

---

## 2. Folder Structure

```
base-project-machine-tools-mobile/
├── android/                        # Android native project
├── ios/                            # iOS native project
│
├── src/
│   ├── api/
│   │   ├── axiosInstance.ts        # Axios config with token interceptors
│   │   ├── authApi.ts             # Login, refresh token
│   │   ├── deviceApi.ts           # Device listing
│   │   ├── borrowRequestApi.ts    # Borrow request CRUD
│   │   ├── returnRequestApi.ts    # Return request CRUD
│   │   ├── transactionApi.ts      # Transaction history
│   │   ├── notificationApi.ts     # Notifications
│   │   └── imageApi.ts            # Image upload
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── empty-state.png
│   │   │   └── placeholder.png
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorView.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── RefreshableList.tsx
│   │   │
│   │   ├── device/
│   │   │   ├── DeviceCard.tsx
│   │   │   ├── DeviceListItem.tsx
│   │   │   ├── DeviceDetail.tsx
│   │   │   └── DeviceFilter.tsx
│   │   │
│   │   ├── borrow/
│   │   │   ├── BorrowRequestCard.tsx
│   │   │   ├── BorrowForm.tsx
│   │   │   ├── BorrowStatusTimeline.tsx
│   │   │   └── BorrowImageCapture.tsx
│   │   │
│   │   ├── return/
│   │   │   ├── ReturnForm.tsx
│   │   │   ├── ReturnImageCapture.tsx
│   │   │   └── BrokenReportForm.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── RequestApprovalCard.tsx
│   │   │   ├── ApprovalActions.tsx
│   │   │   └── BrokenConfirmCard.tsx
│   │   │
│   │   └── layout/
│   │       ├── TabBar.tsx
│   │       ├── HeaderBar.tsx
│   │       └── NotificationBell.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Auth state, tokens
│   │   └── NotificationContext.tsx  # Push notification state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDevices.ts
│   │   ├── useBorrowRequests.ts
│   │   ├── useReturnRequests.ts
│   │   ├── useTransactions.ts
│   │   ├── useNotifications.ts
│   │   ├── useCamera.ts            # Camera hook
│   │   ├── useImagePicker.ts       # Gallery picker hook
│   │   └── useRefresh.ts           # Pull-to-refresh hook
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Main navigator
│   │   ├── AuthNavigator.tsx        # Login stack
│   │   ├── EmployeeTabNavigator.tsx # Employee bottom tabs
│   │   ├── AdminTabNavigator.tsx    # Admin bottom tabs
│   │   ├── DeviceStackNavigator.tsx # Device detail stack
│   │   ├── BorrowStackNavigator.tsx # Borrow flow stack
│   │   └── navigationTypes.ts      # Type definitions for navigation
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── LoginScreen.styles.ts
│   │   │
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx           # Dashboard / overview
│   │   │   └── HomeScreen.styles.ts
│   │   │
│   │   ├── devices/
│   │   │   ├── DeviceListScreen.tsx     # Browse available devices
│   │   │   ├── DeviceDetailScreen.tsx   # Device details
│   │   │   └── DeviceListScreen.styles.ts
│   │   │
│   │   ├── borrow/
│   │   │   ├── BorrowRequestScreen.tsx  # Create borrow request
│   │   │   ├── BorrowPhotoScreen.tsx    # Take photo proof
│   │   │   ├── MyBorrowsScreen.tsx      # My borrow history
│   │   │   ├── BorrowDetailScreen.tsx   # Borrow request detail
│   │   │   └── BorrowRequestScreen.styles.ts
│   │   │
│   │   ├── return/
│   │   │   ├── ReturnRequestScreen.tsx  # Submit return
│   │   │   ├── ReturnPhotoScreen.tsx    # Take return photo
│   │   │   ├── BrokenReportScreen.tsx   # Report broken device
│   │   │   └── ReturnRequestScreen.styles.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── PendingRequestsScreen.tsx  # Admin: pending borrows
│   │   │   ├── RequestDetailScreen.tsx    # Admin: request detail
│   │   │   ├── ReturnConfirmScreen.tsx    # Admin: confirm returns
│   │   │   ├── BrokenReportsScreen.tsx    # Admin: broken reports
│   │   │   ├── AllHistoryScreen.tsx       # Admin: full history
│   │   │   └── PendingRequestsScreen.styles.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── ProfileScreen.styles.ts
│   │   │
│   │   └── notifications/
│   │       ├── NotificationScreen.tsx
│   │       └── NotificationScreen.styles.ts
│   │
│   ├── services/
│   │   ├── storageService.ts        # AsyncStorage wrapper
│   │   ├── notificationService.ts   # Push notification setup
│   │   └── cameraService.ts         # Camera utilities
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── device.types.ts
│   │   ├── borrowRequest.types.ts
│   │   ├── returnRequest.types.ts
│   │   ├── transaction.types.ts
│   │   ├── notification.types.ts
│   │   ├── navigation.types.ts
│   │   ├── common.types.ts
│   │   └── enums.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── dateUtils.ts
│   │   ├── formatUtils.ts
│   │   ├── validationUtils.ts
│   │   └── permissionUtils.ts      # Role-based checks
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   └── App.tsx
│
├── __tests__/
│   ├── screens/
│   └── components/
│
├── .env
├── .env.development
├── .env.production
├── .gitignore
├── app.json
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
├── react-native.config.js
└── README.md
```

---

## 3. Database Design

N/A — The mobile app does not have a local database. All data is fetched from APIs:
- **User Management API** — Authentication
- **Machine Tools API** — Device and borrow data

### Local Storage (AsyncStorage)
| Key | Type | Description |
|-----|------|-------------|
| `accessToken` | string | JWT access token |
| `refreshToken` | string | Refresh token |
| `user` | JSON | Cached user profile |
| `lastSyncTime` | string | Last data sync timestamp |
| `devicePushToken` | string | FCM/APNS push token |

---

## 4. Entity Definitions (TypeScript Types)

### Auth Types
```typescript
// auth.types.ts
export interface LoginDto {
  phoneNumber: string;
  password: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface LoginResultDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  userName: string;
  email?: string;
  phoneNumber?: string;
  fullName: string;
  roles: string[];
  employeeCode?: string;
  avatarUrl?: string;
}
```

### Device Types
```typescript
// device.types.ts
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
  imageUrl?: string;
}

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
```

### Borrow Types
```typescript
// borrowRequest.types.ts
export interface CreateBorrowRequestDto {
  deviceId: string;
  quantity: number;
  expectedReturnDate: string;  // ISO date
  purpose?: string;
  notes?: string;
}

export interface BorrowRequestDto {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  status: BorrowRequestStatus;
  purpose?: string;
  images: ImageDto[];
  creationTime: string;
}

export enum BorrowRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Returned = 3,
  Overdue = 4,
}
```

### Return Types
```typescript
// returnRequest.types.ts
export interface CreateReturnRequestDto {
  borrowRequestId: string;
  quantity: number;
  condition?: string;
  isBroken: boolean;
  brokenDescription?: string;
  notes?: string;
}

export interface CreateBrokenReportDto {
  borrowRequestId: string;
  deviceId: string;
  description: string;
  notes?: string;
}
```

---

## 5. API Endpoints (Consumed)

### Authentication (User Management API)
| Action | Method | Endpoint |
|--------|--------|----------|
| Login (Phone) | POST | `/api/auth/login/phone` |
| Login (Google) | POST | `/api/auth/login/google` |
| Refresh Token | POST | `/api/auth/refresh-token` |
| Get Profile | GET | `/api/profile` |
| Update Profile | PUT | `/api/profile` |

### Devices (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| List Available | GET | `/api/devices/available` |
| Get Detail | GET | `/api/devices/{id}` |
| List All (Admin) | GET | `/api/devices` |

### Borrow Requests (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| Create | POST | `/api/borrow-requests` |
| My Borrows | GET | `/api/borrow-requests/my` |
| Get Detail | GET | `/api/borrow-requests/{id}` |
| Upload Images | POST | `/api/borrow-requests/{id}/images` |
| List All (Admin) | GET | `/api/borrow-requests` |
| Pending (Admin) | GET | `/api/borrow-requests/pending` |
| Approve (Admin) | PUT | `/api/borrow-requests/{id}/approve` |
| Reject (Admin) | PUT | `/api/borrow-requests/{id}/reject` |

### Return Requests (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| Create | POST | `/api/return-requests` |
| My Returns | GET | `/api/return-requests/my` |
| Upload Images | POST | `/api/return-requests/{id}/images` |
| Report Broken | POST | `/api/return-requests/{id}/broken-report` |
| List All (Admin) | GET | `/api/return-requests` |
| Confirm (Admin) | PUT | `/api/return-requests/{id}/confirm` |
| Confirm Broken (Admin) | PUT | `/api/return-requests/{id}/confirm-broken` |

### Transactions (Machine Tools API)
| Action | Method | Endpoint |
|--------|--------|----------|
| My History | GET | `/api/transactions/my` |
| All (Admin) | GET | `/api/transactions` |

### Notifications
| Action | Method | Endpoint |
|--------|--------|----------|
| List | GET | `/api/notifications` |
| Mark Read | PUT | `/api/notifications/{id}/read` |

---

## 6. Authentication Flow

### Phone Login Flow
```
User                    Mobile App                User Management API
  │                         │                            │
  │──Enter phone+password──▶│                            │
  │                         │──POST /api/auth/login/phone▶
  │                         │  { phone, password }       │
  │                         │                            │
  │                         │◀──{ accessToken,           │
  │                         │     refreshToken }─────────│
  │                         │                            │
  │                         │──Store in AsyncStorage─────│
  │                         │                            │
  │                         │──Decode JWT claims         │
  │                         │  → Determine role          │
  │                         │  → Navigate to correct tab │
  │                         │                            │
  │◀──Employee or Admin Home│                            │
```

### Google Login Flow
```
User                Mobile App          Google SDK      User Management API
  │                     │                   │                   │
  │──Tap Google Login──▶│                   │                   │
  │                     │──GoogleSignIn()──▶│                   │
  │                     │◀──idToken────────│                   │
  │                     │                   │                   │
  │                     │──POST /api/auth/login/google─────────▶
  │                     │  { idToken }      │                   │
  │                     │                   │                   │
  │                     │◀──{ accessToken, refreshToken }──────│
  │                     │                   │                   │
  │◀──Navigate to Home──│                   │                   │
```

### Borrow Flow with Photo
```
Employee               Mobile App              Machine Tools API
  │                        │                          │
  │──Select device────────▶│                          │
  │                        │──GET /api/devices/{id}──▶│
  │                        │◀──Device details─────────│
  │                        │                          │
  │──Fill borrow form─────▶│                          │
  │  (qty, purpose, date)  │                          │
  │                        │                          │
  │──Take photo───────────▶│                          │
  │  (Camera opens)        │──Capture & compress──────│
  │                        │                          │
  │──Submit───────────────▶│                          │
  │                        │──POST /api/borrow-requests─▶
  │                        │  { deviceId, qty, etc. }  │
  │                        │◀──{ id }─────────────────│
  │                        │                          │
  │                        │──POST /api/borrow-requests/{id}/images─▶
  │                        │  (multipart: image file)  │
  │                        │◀──OK─────────────────────│
  │                        │                          │
  │◀──Request Submitted────│                          │
```

---

## 7. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React Native 0.73+ (CLI) | Cross-platform, large ecosystem |
| Language | TypeScript | Type safety |
| Navigation | React Navigation v6 | Standard RN navigation |
| HTTP | Axios | Consistent with web, interceptors |
| Server State | TanStack Query v5 | Caching, offline support |
| Local State | React Context | Auth and theme |
| Local Storage | AsyncStorage | Token and preference storage |
| Camera | react-native-camera / expo-camera | Photo capture |
| Image Picker | react-native-image-picker | Gallery selection |
| Push Notifications | @react-native-firebase/messaging | FCM for Android + iOS |
| Google Sign-In | @react-native-google-signin/google-signin | OAuth2 flow |
| UI Components | React Native Paper v5 | Material Design, accessible |
| Forms | React Hook Form + Zod | Consistent with web |
| Image Compression | react-native-image-resizer | Reduce upload size |
| Date | dayjs | Lightweight |
| Linting | ESLint + Prettier | Code quality |
| Testing | Jest + React Native Testing Library | Standard RN testing |

### Development Setup
- Metro Bundler: `http://localhost:8081`
- Android: Emulator or physical device
- iOS: Simulator or physical device

---

## 8. Screen Design

### Navigation Structure

```
AppNavigator
├── AuthNavigator (when not logged in)
│   └── LoginScreen
│
├── EmployeeTabNavigator (when role = Employee)
│   ├── Home Tab
│   │   └── HomeScreen (Dashboard)
│   ├── Devices Tab
│   │   ├── DeviceListScreen
│   │   └── DeviceDetailScreen
│   ├── My Borrows Tab
│   │   ├── MyBorrowsScreen
│   │   ├── BorrowDetailScreen
│   │   ├── BorrowRequestScreen
│   │   ├── BorrowPhotoScreen
│   │   ├── ReturnRequestScreen
│   │   ├── ReturnPhotoScreen
│   │   └── BrokenReportScreen
│   ├── Notifications Tab
│   │   └── NotificationScreen
│   └── Profile Tab
│       └── ProfileScreen
│
└── AdminTabNavigator (when role = Admin)
    ├── Home Tab
    │   └── HomeScreen (Admin Dashboard)
    ├── Devices Tab
    │   ├── DeviceListScreen
    │   └── DeviceDetailScreen
    ├── Requests Tab
    │   ├── PendingRequestsScreen
    │   ├── RequestDetailScreen
    │   ├── ReturnConfirmScreen
    │   └── BrokenReportsScreen
    ├── History Tab
    │   └── AllHistoryScreen
    ├── Notifications Tab
    │   └── NotificationScreen
    └── Profile Tab
        └── ProfileScreen
```

### Screen Descriptions

#### 1. Login Screen
- App logo
- Phone number input
- Password input
- Login button
- "Login with Google" button
- Form validation
- Loading state

#### 2. Home Screen (Employee)
- Welcome greeting
- Quick stats (Active borrows, Pending requests)
- Recent borrow requests (list)
- Due soon reminders (highlighted cards)
- Quick action buttons (Borrow, Return)

#### 3. Home Screen (Admin)
- Overview stats cards (Total devices, Active borrows, Pending, Overdue)
- Pending approvals count (highlighted)
- Recent activities list

#### 4. Device List Screen
- Search bar
- Category filter chips
- Device type toggle (Tools / Consumables)
- FlatList of DeviceCard components
- Pull-to-refresh
- Infinite scroll / pagination

#### 5. Device Detail Screen
- Device image (with zoom)
- Name, code, category, type
- Available quantity indicator (progress bar)
- Location
- Status badge
- "Borrow" button (if available, employee)
- Borrow history section

#### 6. Borrow Request Screen
- Device info header
- Quantity input (number stepper)
- Expected return date picker (for Tools)
- Purpose text input
- Notes text input
- "Take Photo" button → Camera
- Photo preview
- Submit button

#### 7. Borrow Photo Screen
- Camera view (full screen)
- Capture button
- Flash toggle
- Switch camera
- Photo preview with retake/use options

#### 8. My Borrows Screen
- Tabs: Active | Pending | Completed
- FlatList of BorrowRequestCard
- Status badge on each card
- Pull-to-refresh
- Tap to view detail

#### 9. Borrow Detail Screen
- Device info
- Borrow info (date, expected return, qty)
- Status timeline
- Approval info (if approved/rejected)
- Proof images gallery
- Action buttons:
  - "Return" (if approved)
  - "Report Broken" (if approved)

#### 10. Return Request Screen
- Borrow info header
- Quantity input
- Condition notes
- "Is broken?" toggle
- Broken description (if broken)
- "Take Photo" button → Camera
- Photo preview
- Submit button

#### 11. Broken Report Screen
- Device info
- Description text area
- Photo capture (multiple photos)
- Submit button

#### 12. Admin: Pending Requests Screen
- FlatList of pending borrow requests
- Each card shows: Employee, Device, Qty, Date
- "Approve" and "Reject" buttons on each card
- Tap for detail

#### 13. Admin: Request Detail Screen
- Full borrow request info
- Employee info
- Device info
- Proof images
- Approve button (with optional notes)
- Reject button (with required reason)

#### 14. Admin: Return Confirm Screen
- Return request list
- Device condition info
- Proof images
- Confirm / Reject buttons

#### 15. Admin: Broken Reports Screen
- List of broken reports
- Photos of broken devices
- Confirm / Reject broken status

#### 16. Admin: All History Screen
- Filter by: Date range, Device, Employee, Type
- Transaction list with details
- Scrollable timeline view

#### 17. Notification Screen
- List of notifications
- Unread highlighted
- Mark as read on tap
- Pull-to-refresh

#### 18. Profile Screen
- Avatar with edit option
- Full name
- Employee code
- Phone number
- Email
- Department
- Logout button

---

## 9. Implementation Steps

### Phase 1: Project Setup
1. Create React Native project: `npx react-native init BaseProjectMobile --template react-native-template-typescript`
2. Install dependencies:
   ```
   react-navigation, react-native-screens, react-native-safe-area-context
   axios, @tanstack/react-query
   react-native-paper, react-native-vector-icons
   react-hook-form, @hookform/resolvers, zod
   @react-native-async-storage/async-storage
   react-native-image-picker
   @react-native-google-signin/google-signin
   @react-native-firebase/app, @react-native-firebase/messaging
   dayjs
   react-native-image-resizer
   ```
3. Configure TypeScript
4. Configure Metro bundler
5. Setup Android and iOS native configurations

### Phase 2: Foundation
6. Create folder structure
7. Setup Axios instance with token interceptors
8. Create AuthContext and useAuth hook
9. Setup React Navigation structure
10. Create theme (colors, typography, spacing)
11. Setup React Query provider

### Phase 3: Auth Flow
12. Implement LoginScreen (phone + password)
13. Implement Google Sign-In integration
14. Implement token storage with AsyncStorage
15. Implement auto-login (check stored token on app start)
16. Implement role-based navigation switching

### Phase 4: Common Components
17. Create Button, Card, Input components
18. Create StatusBadge component
19. Create LoadingOverlay
20. Create ErrorView and EmptyState
21. Create RefreshableList (FlatList with pull-to-refresh)
22. Create DeviceCard and BorrowRequestCard
23. Create image picker/camera components

### Phase 5: Employee Screens
24. Implement HomeScreen (employee dashboard)
25. Implement DeviceListScreen with search and filters
26. Implement DeviceDetailScreen
27. Implement BorrowRequestScreen (form)
28. Implement BorrowPhotoScreen (camera)
29. Implement MyBorrowsScreen (list with tabs)
30. Implement BorrowDetailScreen
31. Implement ReturnRequestScreen
32. Implement ReturnPhotoScreen
33. Implement BrokenReportScreen

### Phase 6: Admin Screens
34. Implement Admin HomeScreen (dashboard)
35. Implement PendingRequestsScreen
36. Implement RequestDetailScreen (approve/reject)
37. Implement ReturnConfirmScreen
38. Implement BrokenReportsScreen
39. Implement AllHistoryScreen

### Phase 7: Profile & Notifications
40. Implement ProfileScreen
41. Implement NotificationScreen
42. Setup push notifications (Firebase)
43. Implement notification handling in background

### Phase 8: Integration & Polish
44. Connect all API endpoints
45. Test complete borrow flow (Employee)
46. Test complete approval flow (Admin)
47. Test return and broken report flows
48. Test Google login
49. Handle offline scenarios gracefully
50. Image compression before upload
51. Loading states and error handling
52. Pull-to-refresh on all lists
53. Android and iOS platform testing

---

## 10. Environment Configuration

### .env.development
```
API_USER_MANAGEMENT_URL=http://10.0.2.2:5001
API_MACHINE_TOOLS_URL=http://10.0.2.2:5002
GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### .env.production
```
API_USER_MANAGEMENT_URL=https://api-auth.yourdomain.com
API_MACHINE_TOOLS_URL=https://api-tools.yourdomain.com
GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> Note: `10.0.2.2` is Android emulator's alias for `localhost`. For iOS simulator, use `localhost` directly.

---

## 11. Push Notification Strategy

### Notification Types
| Type | Recipient | Trigger |
|------|-----------|---------|
| Borrow Request Created | Admin | Employee submits request |
| Borrow Approved | Employee | Admin approves request |
| Borrow Rejected | Employee | Admin rejects request |
| Return Confirmed | Employee | Admin confirms return |
| Broken Report Confirmed | Employee | Admin confirms broken report |
| Due Date Reminder | Employee | 1 day before expected return |
| Overdue Alert | Employee + Admin | Return date passed |

### Implementation
```typescript
// Firebase Cloud Messaging setup
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Handle notification in background
});

messaging().onMessage(async remoteMessage => {
  // Handle notification in foreground
  // Show in-app notification
});
```

---

## 12. User Management Integration & Bug Fixes (Added 2026-02-28)

### Critical Fixes Applied
| Fix | Details |
|-----|---------|
| `atob` polyfill | React Native (Hermes/JSC) has no `atob`. Added `base-64` package for JWT decoding |
| `Alert.prompt` Android | `Alert.prompt` is iOS-only. Replaced with custom TextInput modal for reject reason input on Android |
| Token refresh path | Fixed from `/api/auth/refresh` to `/api/auth/refresh-token` to match server |
| Hardcoded localhost | Replaced with config-based URLs supporting Android emulator (`10.0.2.2`) |
| `babel-plugin-module-resolver` | Added missing devDependency |

### User Management in Mobile
The mobile app does NOT have user management CRUD screens (that's an admin web function). Mobile users interact with:
- **Login/Auth** via User Management API
- **Profile** viewing/editing via `/api/profile` 
- **Role-based navigation**: Admin gets extra tabs (Requests, History) while Employee gets standard tabs (Home, Devices, MyBorrows, Profile)

### Role-Based Navigation
| Navigator | Role | Tabs |
|-----------|------|------|
| `EmployeeTabNavigator` | Employee | Home, Devices, MyBorrows, Profile |
| `AdminTabNavigator` | Admin | Home, Devices, Requests, History, Profile |
