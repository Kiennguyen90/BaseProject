# Base Project — Monorepo

A full-stack enterprise application built with **ABP Framework 9.0** (.NET 9), **React 18** (Vite), and **React Native 0.76**. The project manages machine tools borrowing/returning with a dedicated user management microservice.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Monorepo Structure](#monorepo-structure)
- [Prerequisites](#prerequisites)
- [Quick Start — Docker Compose](#quick-start--docker-compose)
- [Manual Local Development](#manual-local-development)
- [Service Endpoints](#service-endpoints)
- [Database Details](#database-details)
- [Key Fixes Applied](#key-fixes-applied)
- [Docker Infrastructure](#docker-infrastructure)
- [Mobile App](#mobile-app)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Admin (React)                       │
│                   http://localhost:3000                      │
│                  nginx reverse proxy                        │
├──────────────────────┬──────────────────────────────────────┤
│  /api/auth, /api/users │            /api/*                  │
│          ▼              │              ▼                     │
│  User Management API    │   Machine Tools API               │
│  http://localhost:44301 │   http://localhost:44302           │
├──────────────────────┴──────────────────────────────────────┤
│                    PostgreSQL 16                             │
│               BaseProject_UserManagement                    │
│               BaseProject_MachineTools                      │
└─────────────────────────────────────────────────────────────┘
```

| Component              | Technology                                |
|------------------------|-------------------------------------------|
| User Management API    | .NET 9 / ABP Framework 9.0.2 / EF Core 9 |
| Machine Tools API      | .NET 9 / ABP Framework 9.0.2 / EF Core 9 |
| Web Admin              | React 18 / Vite 6 / Ant Design 5         |
| Mobile App             | React Native 0.76                         |
| Database               | PostgreSQL 16 (Npgsql)                    |
| Containerization       | Docker / Docker Compose                   |

---

## Monorepo Structure

```
Base Project/
├── user-management/                    # User Management microservice (.NET)
│   ├── BaseProject.UserManagement.sln
│   └── src/
│       ├── BaseProject.UserManagement.Application/
│       ├── BaseProject.UserManagement.Application.Contracts/
│       ├── BaseProject.UserManagement.Domain/
│       ├── BaseProject.UserManagement.Domain.Shared/
│       ├── BaseProject.UserManagement.EntityFrameworkCore/
│       ├── BaseProject.UserManagement.HttpApi.Host/         # API (port 44301)
│       └── BaseProject.UserManagement.DbMigrator/           # DB migrator
│
├── machine-tools-management/           # Machine Tools bounded context
│   ├── server/                         # .NET backend
│   │   ├── BaseProject.MachineTools.sln
│   │   └── src/
│   │       ├── BaseProject.MachineTools.Application/
│   │       ├── BaseProject.MachineTools.Application.Contracts/
│   │       ├── BaseProject.MachineTools.Domain/
│   │       ├── BaseProject.MachineTools.Domain.Shared/
│   │       ├── BaseProject.MachineTools.EntityFrameworkCore/
│   │       ├── BaseProject.MachineTools.HttpApi.Host/       # API (port 44302)
│   │       └── BaseProject.MachineTools.DbMigrator/         # DB migrator
│   ├── web-admin/                      # React SPA (Vite, Ant Design)
│   └── mobile-app/                     # React Native app
│
├── docker/                             # Docker infrastructure
│   ├── Dockerfile.user-management-api
│   ├── Dockerfile.user-management-migrator
│   ├── Dockerfile.machine-tools-api
│   ├── Dockerfile.machine-tools-migrator
│   ├── Dockerfile.web-admin
│   ├── init-databases.sql              # Creates both databases on first run
│   └── nginx-web-admin.conf           # Nginx reverse proxy config
│
├── docs/                               # Design / planning documents
│   ├── USER_MANAGEMENT_PLAN.md
│   ├── MACHINE_TOOLS_SERVER_PLAN.md
│   ├── MACHINE_TOOLS_WEB_PLAN.md
│   └── MACHINE_TOOLS_MOBILE_PLAN.md
│
├── docker-compose.yml                  # Full stack orchestration
├── .gitignore
└── README.md
```

---

## Prerequisites

### For Docker Compose (recommended)

| Tool           | Version |
|----------------|---------|
| Docker Desktop | 4.x+    |
| Docker Compose | 2.x+    |

### For Local Development

| Tool           | Version  | Notes                                |
|----------------|----------|--------------------------------------|
| .NET SDK       | 9.0.201+ | `dotnet --version`                   |
| Node.js        | 18+      | `node --version`                     |
| PostgreSQL     | 16       | Running on port 5432                 |
| npm / yarn     | latest   | For web-admin                        |
| React Native CLI | -      | For mobile-app (+ Android/iOS SDK)   |

---

## Quick Start — Docker Compose

The fastest way to run the entire stack:

```bash
# 1. Clone the repo
git clone <repository-url> "Base Project"
cd "Base Project"

# 2. Start everything
docker-compose up --build

# This will:
#   - Start PostgreSQL 16 + Redis 7
#   - Create databases (BaseProject_UserManagement, BaseProject_MachineTools)
#   - Run both DbMigrators (apply migrations + seed data)
#   - Start User Management API on port 44301
#   - Start Machine Tools API on port 44302
#   - Build & serve Web Admin on port 3000 (nginx)
```

### Useful Docker Commands

```bash
# Start in detached mode
docker-compose up -d --build

# View logs for a specific service
docker-compose logs -f user-management-api

# Re-run migrations only
docker-compose up user-management-migrator machine-tools-migrator

# Tear down everything (including volumes/data)
docker-compose down -v

# Rebuild a single service
docker-compose build machine-tools-api
```

---

## Manual Local Development

### 1. Start PostgreSQL

Ensure PostgreSQL 16 is running on `localhost:5432` with user `postgres` / password `postgres`.

Create the databases:

```sql
CREATE DATABASE "BaseProject_UserManagement";
CREATE DATABASE "BaseProject_MachineTools";
```

Or start just the database from Docker Compose:

```bash
docker-compose up -d postgres
```

### 2. Run Database Migrations

```bash
# User Management migrations + seed data
cd user-management/src/BaseProject.UserManagement.DbMigrator
dotnet run

# Machine Tools migrations + seed data
cd ../../../machine-tools-management/server/src/BaseProject.MachineTools.DbMigrator
dotnet run
```

### 3. Start the APIs

```bash
# Terminal 1 — User Management API
cd user-management/src/BaseProject.UserManagement.HttpApi.Host
dotnet run
# → http://localhost:5001  |  https://localhost:44301

# Terminal 2 — Machine Tools API
cd machine-tools-management/server/src/BaseProject.MachineTools.HttpApi.Host
dotnet run
# → http://localhost:5002  |  https://localhost:44302
```

### 4. Start the Web Admin

```bash
cd machine-tools-management/web-admin
npm install
npm run dev
# → http://localhost:3000
```

### 5. Start the Mobile App

```bash
cd machine-tools-management/mobile-app
npm install

# Android
npx react-native run-android

# iOS (macOS only)
npx react-native run-ios
```

---

## Service Endpoints

### Local Development

| Service              | HTTP                  | HTTPS                  |
|----------------------|-----------------------|------------------------|
| User Management API  | http://localhost:5001  | https://localhost:44301 |
| Machine Tools API    | http://localhost:5002  | https://localhost:44302 |
| Web Admin            | http://localhost:3000  | —                      |
| PostgreSQL           | localhost:5432        | —                      |
| Redis                | localhost:6379        | —                      |

### Docker Compose

| Service              | URL                          |
|----------------------|------------------------------|
| User Management API  | http://localhost:44301       |
| Machine Tools API    | http://localhost:44302       |
| Web Admin            | http://localhost:3000        |
| PostgreSQL           | localhost:5432               |

### Swagger UI

- **User Management**: http://localhost:5001/swagger (local) or http://localhost:44301/swagger (Docker)
- **Machine Tools**: http://localhost:5002/swagger (local) or http://localhost:44302/swagger (Docker)

### Default Admin Credentials

| Field    | Value          |
|----------|----------------|
| Email    | admin@abp.io   |
| Password | 1q2w3E*        |

---

## Database Details

### Connection Strings (local development)

Both APIs read from `appsettings.json`:

```
User Management: Host=localhost;Port=5432;Database=BaseProject_UserManagement;Username=postgres;Password=postgres
Machine Tools:   Host=localhost;Port=5432;Database=BaseProject_MachineTools;Username=postgres;Password=postgres
```

In Docker, these are overridden via the `ConnectionStrings__Default` environment variable with `Host=postgres` (service DNS).

### Schema Overview

**BaseProject_UserManagement** — ABP Identity + OpenIddict tables:
- `AbpUsers`, `AbpRoles`, `AbpPermissionGrants`
- `OpenIddictApplications`, `OpenIddictTokens`, `OpenIddictScopes`
- `AbpSettings`, `AbpFeatureValues`
- Seeded with admin user and `admin`/`Employee` roles

**BaseProject_MachineTools** — Domain tables:
- `AppDevices` — Machine/tool inventory
- `AppBorrowRequests`, `AppBorrowRequestDevices` — Borrowing workflow
- `AppReturnRequests`, `AppReturnRequestDevices` — Return workflow
- `AppTransactions`, `AppTransactionDevices` — Transaction log

---

## Key Fixes Applied

### 1. Npgsql DateTime UTC Fix

**Problem**: `Cannot write DateTime with Kind=Local to PostgreSQL type 'timestamp with time zone', only UTC is supported`

**Root cause**: Npgsql 6+ enforces UTC for `timestamptz` columns, but ABP seed data uses `DateTime.Now` / `DateTime.Local`.

**Fix applied**: Added the following to **all** .NET entry points (DbMigrators + API Hosts):

```csharp
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
```

**Files modified**:
- `user-management/src/BaseProject.UserManagement.DbMigrator/Program.cs`
- `user-management/src/BaseProject.UserManagement.HttpApi.Host/Program.cs`
- `machine-tools-management/server/src/BaseProject.MachineTools.HttpApi.Host/Program.cs`
- `machine-tools-management/server/src/BaseProject.MachineTools.DbMigrator/Program.cs` (already had it)

### 2. DbMigrator ABP Bootstrapping

**Problem**: DbMigrators were not applying EF Core migrations or seed data.

**Fix**: Rewrote both DbMigrators to properly bootstrap the ABP application, resolve `IServiceProvider`, and call `MigrateAsync()` + data seeding through ABP's `IDataSeeder`.

### 3. EF Core Module Registration

**Problem**: UserManagement DbContext was missing module registrations for ABP PermissionManagement and SettingManagement.

**Fix**: Added `builder.ConfigurePermissionManagement()` and `builder.ConfigureSettingManagement()` to the `OnModelCreating` override.

### 4. Monorepo Restructuring

Consolidated separate repos into a single monorepo without breaking any `.csproj` `ProjectReference` paths or `.sln` project paths (internal relative references were preserved).

---

## Docker Infrastructure

### Service Dependency Chain

```
postgres (healthcheck: pg_isready)
  ├── user-management-migrator (depends_on: postgres healthy)
  │     └── user-management-api (depends_on: migrator completed_successfully)
  ├── machine-tools-migrator (depends_on: postgres healthy)
  │     └── machine-tools-api (depends_on: migrator completed_successfully)
  └── redis (independent)

web-admin (depends_on: both APIs)
```

### Nginx Reverse Proxy (web-admin)

The nginx config routes API calls from the frontend:

| Route Pattern         | Proxied To              |
|-----------------------|-------------------------|
| `/api/auth/*`         | user-management-api     |
| `/api/users/*`        | user-management-api     |
| `/api/*`              | machine-tools-api       |
| `/*` (everything else)| SPA static files        |

### Multi-Stage Builds

All .NET Dockerfiles use multi-stage builds:
1. **restore** — Copies `.csproj` files, runs `dotnet restore`
2. **build** — Copies source, runs `dotnet publish`
3. **runtime** — Uses `mcr.microsoft.com/dotnet/aspnet:9.0` base image

The web-admin Dockerfile:
1. **build** — `node:18-alpine`, runs `npm ci && npx vite build`
2. **runtime** — `nginx:alpine`, serves the `dist/` output

---

## Mobile App

The React Native mobile app is located at `machine-tools-management/mobile-app/`.

### Configuration

API base URL is configured in `src/config.ts`. Update it to point to your development machine's IP address when testing on a physical device:

```typescript
// For Android emulator
export const API_BASE_URL = 'http://10.0.2.2:44302';

// For physical device (use your machine's LAN IP)
export const API_BASE_URL = 'http://192.168.x.x:44302';
```

### Features

- Employee device borrowing/returning workflow
- Admin approval dashboard
- Authentication via User Management API
- Device inventory browsing

---

## Troubleshooting

### PostgreSQL connection refused

Ensure PostgreSQL is running and accessible on port 5432:

```bash
# Check if port is in use
netstat -an | findstr 5432

# Or start via Docker
docker-compose up -d postgres
```

### Migration errors about DateTime

If you see `Cannot write DateTime with Kind=Local to PostgreSQL type 'timestamp with time zone'`, ensure the `AppContext.SetSwitch` line is present in the entry point **before** any ABP/EF Core initialization:

```csharp
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
```

### Docker build fails — file not found

Ensure you're running `docker-compose` from the repository root (`Base Project/`). The build contexts and Dockerfile paths are relative to the root.

### Web admin shows blank page

Check that both APIs are running and the nginx proxy config is mounted:

```bash
docker-compose logs web-admin
docker-compose logs user-management-api
docker-compose logs machine-tools-api
```

### Mobile app can't connect to API

- **Android emulator**: Use `10.0.2.2` instead of `localhost`
- **Physical device**: Use your machine's LAN IP and ensure firewall allows the port
- Verify the API is running and accessible from the device's network

---

## License

Private / Internal Use Only.
