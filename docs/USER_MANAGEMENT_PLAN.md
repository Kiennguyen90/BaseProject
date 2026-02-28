# User Management Service — Implementation Plan

## 1. Architecture Overview

### High-Level Architecture
```
┌──────────────────────────────────────────────────────┐
│                   Client Applications                │
│        (Mobile App, Web Admin, Other Services)       │
└──────────────┬───────────────────────┬───────────────┘
               │  HTTP/REST            │  HTTP/REST
               ▼                       ▼
┌──────────────────────────────────────────────────────┐
│              User Management API (ABP)               │
│  ┌─────────────────────────────────────────────────┐ │
│  │             HttpApi.Host (ASP.NET Core)          │ │
│  │  - JWT Token Issuance (OpenIddict)              │ │
│  │  - Google OAuth2 Login                          │ │
│  │  - Phone + Password Login                       │ │
│  │  - REST API Endpoints                           │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │           Application Layer                      │ │
│  │  - UserAppService                               │ │
│  │  - AuthAppService                               │ │
│  │  - RoleAppService                               │ │
│  │  - ProfileAppService                            │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │             Domain Layer                         │ │
│  │  - AppUser Entity                               │ │
│  │  - UserProfile Entity                           │ │
│  │  - Domain Services                              │ │
│  │  - Repository Interfaces                        │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Infrastructure Layer                     │ │
│  │  - EF Core (PostgreSQL)                         │ │
│  │  - Redis Cache                                  │ │
│  │  - Distributed Event Bus                        │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
               │                       │
               ▼                       ▼
        ┌──────────┐           ┌──────────────┐
        │PostgreSQL│           │    Redis      │
        │ Database │           │   (Cache)     │
        └──────────┘           └──────────────┘
```

### Design Principles
- **Independent Auth Server**: This service is the single source of truth for user identity
- **JWT-based**: Issues JWT tokens consumed by all other services
- **Clean Architecture**: ABP Framework layered architecture (Domain → Application → HttpApi → EF Core)
- **Microservice-ready**: Can be deployed independently, communicates via HTTP + events

---

## 2. Folder Structure

```
base-project-user-management/
├── src/
│   ├── BaseProject.UserManagement.Domain.Shared/
│   │   ├── BaseProjectUserManagementDomainSharedModule.cs
│   │   ├── Enums/
│   │   │   ├── UserRole.cs
│   │   │   └── LoginProvider.cs
│   │   ├── Consts/
│   │   │   ├── UserConsts.cs
│   │   │   └── RoleConsts.cs
│   │   └── BaseProject.UserManagement.Domain.Shared.csproj
│   │
│   ├── BaseProject.UserManagement.Domain/
│   │   ├── BaseProjectUserManagementDomainModule.cs
│   │   ├── Users/
│   │   │   ├── AppUser.cs
│   │   │   ├── UserProfile.cs
│   │   │   ├── IUserRepository.cs
│   │   │   └── UserManager.cs (Domain Service)
│   │   ├── Data/
│   │   │   ├── IUserManagementDbSchemaMigrator.cs
│   │   │   └── UserManagementDataSeedContributor.cs
│   │   └── BaseProject.UserManagement.Domain.csproj
│   │
│   ├── BaseProject.UserManagement.Application.Contracts/
│   │   ├── BaseProjectUserManagementApplicationContractsModule.cs
│   │   ├── Users/
│   │   │   ├── IUserAppService.cs
│   │   │   ├── IAuthAppService.cs
│   │   │   ├── IProfileAppService.cs
│   │   │   ├── Dtos/
│   │   │   │   ├── UserDto.cs
│   │   │   │   ├── CreateUserDto.cs
│   │   │   │   ├── UpdateUserDto.cs
│   │   │   │   ├── UserProfileDto.cs
│   │   │   │   ├── UpdateProfileDto.cs
│   │   │   │   ├── LoginWithPhoneDto.cs
│   │   │   │   ├── LoginResultDto.cs
│   │   │   │   ├── GoogleLoginDto.cs
│   │   │   │   ├── RegisterDto.cs
│   │   │   │   ├── ChangePasswordDto.cs
│   │   │   │   └── TokenRefreshDto.cs
│   │   │   └── Validators/
│   │   │       ├── CreateUserDtoValidator.cs
│   │   │       └── LoginWithPhoneDtoValidator.cs
│   │   ├── Roles/
│   │   │   ├── IRoleAppService.cs
│   │   │   └── Dtos/
│   │   │       ├── RoleDto.cs
│   │   │       └── CreateUpdateRoleDto.cs
│   │   ├── Permissions/
│   │   │   ├── UserManagementPermissions.cs
│   │   │   └── UserManagementPermissionDefinitionProvider.cs
│   │   └── BaseProject.UserManagement.Application.Contracts.csproj
│   │
│   ├── BaseProject.UserManagement.Application/
│   │   ├── BaseProjectUserManagementApplicationModule.cs
│   │   ├── BaseProjectUserManagementApplicationAutoMapperProfile.cs
│   │   ├── Users/
│   │   │   ├── UserAppService.cs
│   │   │   ├── AuthAppService.cs
│   │   │   └── ProfileAppService.cs
│   │   ├── Roles/
│   │   │   └── RoleAppService.cs
│   │   └── BaseProject.UserManagement.Application.csproj
│   │
│   ├── BaseProject.UserManagement.EntityFrameworkCore/
│   │   ├── BaseProjectUserManagementEntityFrameworkCoreModule.cs
│   │   ├── EntityFrameworkCore/
│   │   │   ├── UserManagementDbContext.cs
│   │   │   ├── UserManagementDbContextFactory.cs
│   │   │   ├── EntityTypeConfigurations/
│   │   │   │   ├── AppUserConfiguration.cs
│   │   │   │   └── UserProfileConfiguration.cs
│   │   │   └── Repositories/
│   │   │       └── UserRepository.cs
│   │   ├── Migrations/
│   │   └── BaseProject.UserManagement.EntityFrameworkCore.csproj
│   │
│   └── BaseProject.UserManagement.HttpApi.Host/
│       ├── BaseProjectUserManagementHttpApiHostModule.cs
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── UserController.cs
│       │   ├── ProfileController.cs
│       │   └── RoleController.cs
│       ├── Properties/
│       │   └── launchSettings.json
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Program.cs
│       └── BaseProject.UserManagement.HttpApi.Host.csproj
│
├── test/
│   ├── BaseProject.UserManagement.Domain.Tests/
│   ├── BaseProject.UserManagement.Application.Tests/
│   └── BaseProject.UserManagement.EntityFrameworkCore.Tests/
│
├── BaseProject.UserManagement.sln
├── common.props
├── Directory.Build.props
├── .gitignore
└── README.md
```

---

## 3. Database Design

### ER Diagram

```
┌─────────────────────────┐       ┌──────────────────────────┐
│      AbpUsers           │       │      UserProfiles         │
│ (ABP Identity table)    │       │                          │
├─────────────────────────┤       ├──────────────────────────┤
│ Id (Guid) PK            │──────▶│ Id (Guid) PK             │
│ UserName                │       │ UserId (Guid) FK → Users  │
│ Email                   │       │ FullName (string)         │
│ EmailConfirmed          │       │ PhoneNumber (string)      │
│ PasswordHash            │       │ AvatarUrl (string?)       │
│ PhoneNumber             │       │ Department (string?)      │
│ PhoneNumberConfirmed    │       │ EmployeeCode (string?)    │
│ NormalizedUserName      │       │ DateOfBirth (DateTime?)   │
│ NormalizedEmail         │       │ Address (string?)         │
│ ConcurrencyStamp        │       │ CreationTime              │
│ ...ABP default fields   │       │ LastModificationTime      │
└─────────────────────────┘       └──────────────────────────┘
         │
         │ (Many-to-Many via AbpUserRoles)
         ▼
┌─────────────────────────┐
│      AbpRoles           │
│ (ABP Identity table)    │
├─────────────────────────┤
│ Id (Guid) PK            │
│ Name (string)           │
│ NormalizedName           │
│ IsDefault               │
│ IsStatic                │
│ IsPublic                │
│ ...ABP default fields   │
└─────────────────────────┘
```

### Tables

#### AbpUsers (ABP Identity - Extended)
ABP's built-in `IdentityUser` table. We extend the `AppUser` entity with custom properties.

| Column | Type | Description |
|--------|------|-------------|
| Id | Guid (PK) | Primary key |
| UserName | string(256) | Unique username |
| Email | string(256) | Email address |
| PhoneNumber | string(16) | Phone number (login) |
| PasswordHash | string | Hashed password |
| LoginProvider | string? | "Google" or "Phone" or null |
| IsActive | bool | Account active status |
| ...ABP defaults | ... | ABP built-in fields |

#### UserProfiles
| Column | Type | Description |
|--------|------|-------------|
| Id | Guid (PK) | Primary key |
| UserId | Guid (FK) | Links to AbpUsers.Id |
| FullName | string(128) | Full name |
| PhoneNumber | string(16) | Phone (may differ from login phone) |
| AvatarUrl | string?(512) | Profile picture URL |
| Department | string?(128) | Department name |
| EmployeeCode | string?(32) | Company employee code |
| DateOfBirth | DateTime? | Date of birth |
| Address | string?(512) | Home address |
| CreationTime | DateTime | Created at |
| LastModificationTime | DateTime? | Last updated |

#### AbpRoles (ABP Identity - Seeded)
Seeded roles:
- **Admin** — Full system access
- **Employee** — Limited access (borrow tools, view own data)

---

## 4. Entity Definitions

### AppUser (extends ABP IdentityUser)
```csharp
public class AppUser : IdentityUser
{
    public string? LoginProvider { get; set; }  // "Google", "Phone"
    public bool IsActive { get; set; } = true;
}
```

### UserProfile
```csharp
public class UserProfile : FullAuditedAggregateRoot<Guid>
{
    public Guid UserId { get; set; }
    public string FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Department { get; set; }
    public string? EmployeeCode { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
}
```

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/phone` | Login with phone + password |
| POST | `/api/auth/login/google` | Login with Google OAuth2 token |
| POST | `/api/auth/register` | Register new user (phone + password) |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/logout` | Revoke current token |

### User Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (paged, filtered) |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Soft-delete user |
| PUT | `/api/users/{id}/activate` | Activate/deactivate user |
| GET | `/api/users/{id}/roles` | Get user roles |
| PUT | `/api/users/{id}/roles` | Assign roles to user |

### Profile (Current User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update current user profile |
| PUT | `/api/profile/avatar` | Upload avatar |
| PUT | `/api/profile/change-password` | Change password |

### Roles (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List all roles |
| GET | `/api/roles/{id}` | Get role by ID |
| POST | `/api/roles` | Create role |
| PUT | `/api/roles/{id}` | Update role |
| DELETE | `/api/roles/{id}` | Delete role |

---

## 6. Authentication Flow

### Phone + Password Login
```
Client                    User Management API              Database
  │                              │                           │
  │──POST /api/auth/login/phone──▶                           │
  │  { phone, password }         │                           │
  │                              │──Validate credentials────▶│
  │                              │◀─────User found───────────│
  │                              │                           │
  │                              │──Generate JWT─────────────│
  │                              │  (Access + Refresh token) │
  │◀─────{ accessToken,         │                           │
  │        refreshToken,         │                           │
  │        expiresIn }───────────│                           │
```

### Google OAuth2 Login
```
Client                   Google OAuth         User Management API       Database
  │                          │                        │                    │
  │──Google Sign-In──────────▶                        │                    │
  │◀───id_token──────────────│                        │                    │
  │                          │                        │                    │
  │──POST /api/auth/login/google──────────────────────▶                    │
  │  { googleIdToken }       │                        │                    │
  │                          │                        │──Verify token──────▶
  │                          │                        │  (Google API)       │
  │                          │                        │                    │
  │                          │                        │──Find/Create User──▶
  │                          │                        │◀─────User──────────│
  │                          │                        │                    │
  │                          │                        │──Generate JWT──────│
  │◀──────{ accessToken, refreshToken }───────────────│                    │
```

### JWT Token Structure
```json
{
  "sub": "user-guid",
  "email": "user@gmail.com",
  "phone": "+84912345678",
  "name": "Full Name",
  "role": ["Admin"],
  "employee_code": "EMP001",
  "iss": "base-project-user-management",
  "aud": "base-project",
  "exp": 1735689600,
  "iat": 1735686000
}
```

### Token Configuration
- Access Token Expiry: **60 minutes**
- Refresh Token Expiry: **7 days**
- Signing: RS256 (RSA asymmetric keys)
- Issuer: `base-project-user-management`
- Audience: `base-project`

---

## 7. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | .NET 8 LTS + ABP 8.x | Latest LTS, mature ABP support |
| Auth | OpenIddict (ABP default) + custom JWT | ABP integrates OpenIddict; custom endpoints for phone login |
| Database | PostgreSQL 16 | Open source, robust, JSON support |
| ORM | EF Core 8 | ABP default, excellent PostgreSQL support |
| Cache | Redis (primary) / In-memory (fallback) | ABP IDistributedCache abstraction |
| Event Bus | ABP Local + Distributed Event Bus | RabbitMQ-ready for future microservices |
| Google Auth | Google.Apis.Auth | Official Google library for id_token verification |
| Validation | FluentValidation | ABP-integrated, clean validation |
| Mapping | AutoMapper | ABP default |
| API Docs | Swagger/OpenAPI | ABP built-in |
| Logging | Serilog | ABP default, structured logging |
| Health Checks | ASP.NET Health Checks | DB + Redis monitoring |

---

## 8. Implementation Steps

### Phase 1: Project Setup
1. Install ABP CLI: `dotnet tool install -g Volo.Abp.Cli`
2. Create ABP solution: `abp new BaseProject.UserManagement -t app-nolayers --dbms PostgreSQL -u none`
   - OR manually create layered solution following ABP conventions
3. Configure solution structure with all layers
4. Add NuGet packages:
   - `Volo.Abp.Identity.*`
   - `Volo.Abp.OpenIddict.*`
   - `Volo.Abp.EntityFrameworkCore.PostgreSql`
   - `Volo.Abp.Caching.StackExchangeRedis`
   - `Volo.Abp.EventBus.RabbitMq` (optional, configure later)
   - `Google.Apis.Auth`
5. Configure `Directory.Build.props` for shared properties

### Phase 2: Domain Layer
6. Create `AppUser` entity extending ABP IdentityUser
7. Create `UserProfile` entity
8. Define `IUserRepository` interface
9. Create `UserManager` domain service
10. Define domain events (UserCreatedEto, UserUpdatedEto)
11. Define constants and enums in Domain.Shared

### Phase 3: Application Layer
12. Define DTOs in Application.Contracts
13. Define `IUserAppService`, `IAuthAppService`, `IProfileAppService` interfaces
14. Define permissions in Application.Contracts
15. Create FluentValidation validators
16. Implement `UserAppService`
17. Implement `AuthAppService` (phone login, Google login, token generation)
18. Implement `ProfileAppService`
19. Implement `RoleAppService`
20. Configure AutoMapper profiles

### Phase 4: Infrastructure Layer
21. Configure `UserManagementDbContext`
22. Add entity type configurations
23. Implement `UserRepository`
24. Configure PostgreSQL connection in `appsettings.json`
25. Create initial migration
26. Create data seed (Admin role, Employee role, default admin user)

### Phase 5: API Layer
27. Create API controllers
28. Configure JWT authentication
29. Configure Google OAuth2
30. Configure Swagger
31. Configure CORS
32. Configure health checks
33. Configure Serilog

### Phase 6: Caching & Events
34. Configure Redis cache (with in-memory fallback)
35. Configure distributed event bus
36. Implement cache for user lookups

### Phase 7: Testing & Validation
37. Run migrations
38. Test phone login flow
39. Test Google login flow
40. Test user CRUD
41. Test role management
42. Verify JWT tokens are valid for Machine Tools service

---

## 9. Configuration

### appsettings.json
```json
{
  "App": {
    "CorsOrigins": "http://localhost:3000,http://localhost:19000"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=BaseProject_UserManagement;Username=postgres;Password=postgres"
  },
  "AuthServer": {
    "Authority": "https://localhost:44301",
    "RequireHttpsMetadata": false
  },
  "Jwt": {
    "Issuer": "base-project-user-management",
    "Audience": "base-project",
    "SecurityKey": "your-256-bit-secret-key-here-min-32-chars!",
    "ExpirationInMinutes": 60,
    "RefreshTokenExpirationInDays": 7
  },
  "GoogleAuth": {
    "ClientId": "your-google-client-id.apps.googleusercontent.com"
  },
  "Redis": {
    "Configuration": "localhost:6379",
    "IsEnabled": true
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information"
    }
  }
}
```

### Ports
- User Management API: `https://localhost:44301` (HTTPS), `http://localhost:5001` (HTTP)
