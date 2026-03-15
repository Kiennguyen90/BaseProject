# BaseProject — Complete Setup & Developer Guide

> **Audience:** Developers who are new to this project and need to set it up from scratch.  
> **Last updated:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Prerequisites](#3-prerequisites)
4. [Repository Structure](#4-repository-structure)
5. [Environment Setup](#5-environment-setup)
6. [Application Configuration](#6-application-configuration)
7. [Database Setup](#7-database-setup)
8. [Running the Application Locally](#8-running-the-application-locally)
9. [Mobile App — Build & Install on a Physical Device](#9-mobile-app--build--install-on-a-physical-device)
10. [Docker Deployment](#10-docker-deployment)
11. [Making the Application Publicly Accessible](#11-making-the-application-publicly-accessible)
12. [Connecting the Mobile App to the Server](#12-connecting-the-mobile-app-to-the-server)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Overview

**BaseProject** is a multi-platform machine-tools management system that allows employees to borrow, return, and manage physical tools and equipment. It is composed of three client applications backed by two independent API services.

### Applications

| App | Technology | Purpose |
|---|---|---|
| **Web Admin** | React 18 + Vite + Ant Design | Admin panel — manage users, tools, borrow/return requests |
| **Mobile App** | React Native 0.78 (Android) | Staff app — browse tools, submit borrow/return requests |
| **User Management API** | ASP.NET Core 9 (.NET 9) | Authentication, JWT issuance, user CRUD |
| **Machine Tools API** | ASP.NET Core 9 (.NET 9) | Tools, devices, borrow/return request management |

### Technologies Used

| Layer | Technology |
|---|---|
| Backend framework | ASP.NET Core 9 — layered ABP-style architecture |
| ORM | Entity Framework Core 9 |
| Database | PostgreSQL 16 |
| Caching (optional) | Redis 7 |
| Frontend | React 18, Vite 6, TypeScript, Ant Design 5, TanStack Query |
| Mobile | React Native 0.78, TypeScript, React Navigation 7 |
| Containerisation | Docker, Docker Compose |
| Reverse proxy (Docker) | nginx |
| HTTP client | Axios |
| Data utilities | Day.js, React Native Paper, React Native Vector Icons |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Clients                            │
│                                                         │
│   [Web Admin :3000]      [Mobile App (Android/iOS)]    │
│         │                          │                    │
└─────────┼──────────────────────────┼────────────────────┘
          │  /api/auth, /api/users   │  direct requests
          │  /api/* (via nginx)      │  to LAN IP / public IP
          ▼                          ▼
┌─────────────────────┐   ┌──────────────────────────────┐
│  User Management API│   │    Machine Tools API         │
│  Port 44301 / 5001  │   │    Port 44302 / 5002         │
│  (.NET 9)           │   │    (.NET 9)                  │
└────────┬────────────┘   └──────────────┬───────────────┘
         │                               │
         └──────────────┬────────────────┘
                        ▼
              ┌──────────────────┐
              │   PostgreSQL 16  │
              │   Port 5432      │
              └──────────────────┘
```

The **JWT token** is issued by the User Management API and validated by the Machine Tools API using the shared JWT secret — so both services are stateless with respect to authentication.

---

## 3. Prerequisites

Install all of the following before proceeding.

### 3.1 .NET 9 SDK

Required to build and run the backend API projects.

- Download: https://dotnet.microsoft.com/download/dotnet/9.0
- Verify:
  ```bash
  dotnet --version
  # Expected: 9.x.x
  ```

### 3.2 Node.js 20 (LTS)

Required for the Web Admin (Vite) and the React Native Metro bundler.

- Download: https://nodejs.org/en (choose LTS 20.x)
- Verify:
  ```bash
  node --version   # Expected: v20.x.x
  npm --version    # Expected: 10.x.x
  ```

### 3.3 PostgreSQL 16

Required for local development (without Docker).

- Download: https://www.postgresql.org/download/
- Default port: `5432`
- During installation, create a superuser (e.g., `admin` / `admin`)
- Verify:
  ```bash
  psql --version   # Expected: psql (PostgreSQL) 16.x
  ```

> **Tip:** If you use Docker (recommended), you can skip the local PostgreSQL installation entirely. Jump to [Section 10](#10-docker-deployment).

### 3.4 Docker Desktop

Required for the full containerised deployment.

- Download: https://www.docker.com/products/docker-desktop
- Verify:
  ```bash
  docker --version          # Expected: Docker version 25+
  docker compose version    # Expected: Docker Compose version v2+
  ```

### 3.5 Android Development Tools (for Mobile App only)

| Tool | Required version | Purpose |
|---|---|---|
| **Java JDK 17** | 17+ | Android build toolchain |
| **Android Studio** | Hedgehog+ | Android SDK, AVD manager |
| **Android SDK** | API Level 24–35 | Target and minimum SDK |
| **Android NDK** | 27.1.12297006 | Native module compilation |
| Android Build Tools | 35.0.0 | APK compilation |

**Environment variables** that must be set:

```powershell
# Windows — add to System Environment Variables
ANDROID_HOME = C:\Users\<YourUser>\AppData\Local\Android\Sdk
# Add these to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

Verify:
```bash
adb --version    # Expected: Android Debug Bridge version 1.x
```

---

## 4. Repository Structure

```
Base Project/
├── docker/                          # All Dockerfiles and docker support files
│   ├── Dockerfile.user-management-api
│   ├── Dockerfile.user-management-migrator
│   ├── Dockerfile.machine-tools-api
│   ├── Dockerfile.machine-tools-migrator
│   ├── Dockerfile.web-admin
│   ├── init-databases.sql           # PostgreSQL database initialisation script
│   └── nginx-web-admin.conf         # nginx reverse proxy config for Docker
├── docker-compose.yml               # Full stack orchestration
├── user-management/                 # User Management — .NET 9 solution
│   └── src/
│       ├── BaseProject.UserManagement.Domain.Shared/
│       ├── BaseProject.UserManagement.Domain/
│       ├── BaseProject.UserManagement.Application.Contracts/
│       ├── BaseProject.UserManagement.Application/
│       ├── BaseProject.UserManagement.EntityFrameworkCore/
│       ├── BaseProject.UserManagement.HttpApi.Host/   ← API entry point
│       └── BaseProject.UserManagement.DbMigrator/    ← DB migration runner
└── machine-tools-management/
    ├── server/                      # Machine Tools — .NET 9 solution
    │   └── src/
    │       ├── BaseProject.MachineTools.Domain.Shared/
    │       ├── BaseProject.MachineTools.Domain/
    │       ├── BaseProject.MachineTools.Application.Contracts/
    │       ├── BaseProject.MachineTools.Application/
    │       ├── BaseProject.MachineTools.EntityFrameworkCore/
    │       ├── BaseProject.MachineTools.HttpApi.Host/   ← API entry point
    │       └── BaseProject.MachineTools.DbMigrator/    ← DB migration runner
    ├── web-admin/                   # React + Vite web admin
    │   └── src/
    └── mobile-app/                  # React Native Android/iOS app
        └── src/
```

---

## 5. Environment Setup

### 5.1 Install Backend Dependencies

Both .NET solutions restore NuGet packages automatically on first build. You can also restore manually:

```bash
# User Management API
cd "user-management"
dotnet restore

# Machine Tools API
cd "machine-tools-management/server"
dotnet restore
```

### 5.2 Install Web Admin Dependencies

```bash
cd "machine-tools-management/web-admin"
npm install
```

### 5.3 Install Mobile App Dependencies

```bash
cd "machine-tools-management/mobile-app"
npm install
```

---

## 6. Application Configuration

### 6.1 User Management API

**File:** `user-management/src/BaseProject.UserManagement.HttpApi.Host/appsettings.json`

```json
{
  "App": {
    "CorsOrigins": "http://localhost:3000,http://localhost:19000,http://localhost:8081"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=usermanagement;Username=admin;Password=admin"
  },
  "Jwt": {
    "Issuer": "base-project-user-management",
    "Audience": "base-project",
    "SecurityKey": "BaseProject-UserManagement-SecretKey-Min32Chars!!",
    "ExpirationInMinutes": 60,
    "RefreshTokenExpirationInDays": 7
  },
  "GoogleAuth": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  },
  "Redis": {
    "Configuration": "localhost:6379",
    "IsEnabled": false
  }
}
```

**Key settings:**

| Setting | Purpose |
|---|---|
| `CorsOrigins` | Allowed browser/client origins. Add your frontend URLs here. |
| `ConnectionStrings.Default` | PostgreSQL connection string. |
| `Jwt.SecurityKey` | Shared secret used to sign and verify JWT tokens. **Must match** the Machine Tools API. |
| `Jwt.ExpirationInMinutes` | Access token lifetime. |
| `Jwt.RefreshTokenExpirationInDays` | Refresh token lifetime. |
| `Redis.IsEnabled` | Set to `true` to enable distributed caching. |

**File:** `user-management/src/BaseProject.UserManagement.HttpApi.Host/appsettings.Development.json`

Overrides the base config for local development:

```json
{
  "App": {
    "CorsOrigins": "http://localhost:3000,http://localhost:19000,http://localhost:8081"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=usermanagement;Username=admin;Password=admin"
  }
}
```

**File:** `user-management/src/BaseProject.UserManagement.HttpApi.Host/Properties/launchSettings.json`

Controls how the API starts when launched via `dotnet run`:

```json
{
  "profiles": {
    "BaseProject.UserManagement.HttpApi.Host": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "applicationUrl": "https://localhost:44301;http://*:5001"
    }
  }
}
```

> **Why `http://*:5001`?**  
> The `*` binding (instead of `localhost`) allows the server to accept connections from any network interface — including your LAN. This is required for physical mobile devices to reach the server over Wi-Fi.

---

### 6.2 Machine Tools API

**File:** `machine-tools-management/server/src/BaseProject.MachineTools.HttpApi.Host/appsettings.json`

```json
{
  "App": {
    "CorsOrigins": "http://localhost:3000,http://localhost:3001,http://localhost:8081"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5433;Database=machinetools;Username=admin;Password=admin"
  },
  "Jwt": {
    "Key": "BaseProject-UserManagement-SecretKey-Min32Chars!!",
    "Issuer": "base-project-user-management",
    "Audience": "base-project"
  },
  "Urls": "https://localhost:44302;http://localhost:5002"
}
```

> **Important:** The `Urls` field in `appsettings.json` takes precedence over `launchSettings.json`. For local development with physical devices, it is overridden by `appsettings.Development.json`.

**File:** `machine-tools-management/server/src/BaseProject.MachineTools.HttpApi.Host/appsettings.Development.json`

```json
{
  "Urls": "https://localhost:44302;http://*:5002"
}
```

> **Why this override exists:**  
> The `appsettings.json` binds HTTP only to `localhost:5002`. The Development override changes this to `*:5002` so a physical device (phone) can reach the API over the local network.

**File:** `machine-tools-management/server/src/BaseProject.MachineTools.HttpApi.Host/Properties/launchSettings.json`

```json
{
  "profiles": {
    "BaseProject.MachineTools.HttpApi.Host": {
      "commandName": "Project",
      "applicationUrl": "https://localhost:44302;http://*:5002",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

---

### 6.3 Web Admin (Vite Dev Server)

**File:** `machine-tools-management/web-admin/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': {
        target: 'https://localhost:44301',   // → User Management API
        changeOrigin: true,
        secure: false,                       // Accept self-signed dev cert
      },
      '/api': {
        target: 'https://localhost:44302',   // → Machine Tools API
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

> **Why a proxy?**  
> The dev server runs on port `3000`. All `/api/auth` and `/api/users` requests are proxied to the User Management API (port `44301`). All other `/api` requests go to the Machine Tools API (port `44302`). This avoids CORS issues during development and mirrors the nginx setup in production.

---

### 6.4 Mobile App API Config

**File:** `machine-tools-management/mobile-app/src/config.ts`

```typescript
// Toggle this flag based on your target device
const IS_PHYSICAL_DEVICE = true; // true = real phone, false = emulator

const HOST               = IS_PHYSICAL_DEVICE ? '192.168.2.44' : '10.0.2.2';
const AUTH_PORT          = IS_PHYSICAL_DEVICE ? 5001           : 44301;
const MACHINE_TOOLS_PORT = IS_PHYSICAL_DEVICE ? 5002           : 44302;
const SCHEME             = IS_PHYSICAL_DEVICE ? 'http'         : 'https';

export const Config = {
  AUTH_API_URL:         `${SCHEME}://${HOST}:${AUTH_PORT}`,
  MACHINE_TOOLS_API_URL:`${SCHEME}://${HOST}:${MACHINE_TOOLS_PORT}`,
};
```

| Scenario | `HOST` | `SCHEME` | Ports |
|---|---|---|---|
| Android Emulator | `10.0.2.2` | `https` | `44301` / `44302` |
| Physical Device (local) | Your machine's LAN IP | `http` | `5001` / `5002` |
| Physical Device (production) | Your public domain/IP | `https` | `443` (or custom) |

> **Why HTTP for physical devices?**  
> The development HTTPS certificate is self-signed and not trusted by Android. Using HTTP on the local network avoids certificate errors. The `AndroidManifest.xml` already has `android:usesCleartextTraffic="true"` to allow this.

---

## 7. Database Setup

### 7.1 Local Development (without Docker)

Create the two databases in PostgreSQL:

```sql
-- Connect as a superuser (e.g., admin)
CREATE DATABASE usermanagement;
CREATE DATABASE machinetools;
```

Update your connection strings in `appsettings.Development.json` or `appsettings.json` if your credentials differ from the defaults (`admin` / `admin`).

Run EF Core migrations using the DbMigrator console apps:

```bash
# User Management
cd "user-management/src/BaseProject.UserManagement.DbMigrator"
dotnet run

# Machine Tools
cd "machine-tools-management/server/src/BaseProject.MachineTools.DbMigrator"
dotnet run
```

Each DbMigrator connects to its respective database, applies all pending Entity Framework migrations, and seeds initial data (roles, permissions, seed users, etc.).

### 7.2 Via Docker (automated)

When using Docker Compose, the databases are created and migrated automatically:

1. `init-databases.sql` creates the databases on PostgreSQL's first startup.
2. `user-management-migrator` and `machine-tools-migrator` containers run the DbMigrator and exit.
3. The API containers start only after the migrators finish successfully.

No manual database setup is needed.

---

## 8. Running the Application Locally

Run all four services simultaneously. Open four separate terminal windows.

### Terminal 1 — User Management API

```bash
cd "user-management/src/BaseProject.UserManagement.HttpApi.Host"
dotnet run --launch-profile "BaseProject.UserManagement.HttpApi.Host"
```

- Swagger UI: https://localhost:44301/swagger
- HTTP endpoint (for phone): http://0.0.0.0:5001

### Terminal 2 — Machine Tools API

```bash
cd "machine-tools-management/server/src/BaseProject.MachineTools.HttpApi.Host"
dotnet run --launch-profile "BaseProject.MachineTools.HttpApi.Host"
```

- Swagger UI: https://localhost:44302/swagger
- HTTP endpoint (for phone): http://0.0.0.0:5002

### Terminal 3 — Web Admin

```bash
cd "machine-tools-management/web-admin"
npm install      # first time only
npm run dev
```

- URL: http://localhost:3000

### Terminal 4 — Mobile App (Metro Bundler)

```bash
cd "machine-tools-management/mobile-app"
npm install      # first time only
npx react-native start
```

Then, in a separate terminal, build and install to your target device:

```bash
# Android Emulator or connected physical device
npx react-native run-android
```

### How Services Communicate

```
Web Admin (localhost:3000)
  └── Vite proxy /api/auth  → User Management API (localhost:44301)
  └── Vite proxy /api/*     → Machine Tools API   (localhost:44302)

Mobile App
  └── authAxios             → User Management API (5001 or 44301)
  └── apiAxios              → Machine Tools API   (5002 or 44302)

Machine Tools API
  └── JWT validation        → uses shared secret from User Management API
```

---

## 9. Mobile App — Build & Install on a Physical Device

### 9.1 Enable Developer Mode on the Phone

1. Open **Settings → About Phone**
2. Tap **Build Number** 7 times until "You are now a developer!" appears
3. Go to **Settings → Developer Options**
4. Enable **USB Debugging**

### 9.2 Connect the Phone

1. Connect the phone via USB cable
2. Set USB mode to **File Transfer (MTP)** (tap the USB notification on the phone)
3. When prompted on the phone: **Allow USB Debugging** from your computer

### 9.3 Verify the Phone is Detected

```bash
adb devices
# Expected output:
# List of devices attached
# R58N94VZ3LK     device
```

If the list is empty, the phone is not authorised — repeat step 9.2.

### 9.4 Configure the API URL for the Device

Edit `machine-tools-management/mobile-app/src/config.ts`:

```typescript
const IS_PHYSICAL_DEVICE = true;                // ← must be true
const HOST = '192.168.2.44';                    // ← your machine's LAN IP
```

To find your machine's LAN IP:

```powershell
# Windows
ipconfig | findstr /i "IPv4"
# Look for the 192.168.x.x address on your Wi-Fi adapter
```

> **Important:** Your phone must be connected to the **same Wi-Fi network** as your development machine.

### 9.5 Build and Install

```bash
cd "machine-tools-management/mobile-app"
npx react-native run-android
```

This compiles the APK, installs it on the device, and launches the app automatically. The first build takes ~2–3 minutes; subsequent builds are faster (~15–30 seconds).

### 9.6 Viewing Logs from the Device

```bash
# React Native JS logs only (most useful)
adb logcat *:S ReactNative:V ReactNativeJS:V

# All logs from the app
adb logcat --pid=$(adb shell pidof -s com.machinetoolsmobile)
```

---

## 10. Docker Deployment

Docker Compose starts the entire stack (PostgreSQL, Redis, both APIs, and the Web Admin) with a single command. This is the recommended approach for production-like environments.

### 10.1 Stack Overview

```yaml
Services:
  postgres               # PostgreSQL 16 — with automatic database init
  redis                  # Redis 7 — optional caching
  user-management-migrator   # Runs once, applies DB migrations, then exits
  machine-tools-migrator     # Runs once, applies DB migrations, then exits
  user-management-api    # User Management API on port 44301
  machine-tools-api      # Machine Tools API on port 44302
  web-admin              # React app served by nginx on port 3000
```

### 10.2 Build and Start

```bash
# From the project root (where docker-compose.yml is)
docker compose up --build
```

- First run will build all images (5–10 minutes).
- Subsequent runs use the build cache and start in ~30 seconds.

To run in detached (background) mode:

```bash
docker compose up --build -d
```

### 10.3 Access the Services

| Service | URL |
|---|---|
| Web Admin | http://localhost:3000 |
| User Management API (Swagger) | http://localhost:44301/swagger |
| Machine Tools API (Swagger) | http://localhost:44302/swagger |
| PostgreSQL | `localhost:5432` (user: `postgres`, password: `postgres`) |

### 10.4 Stopping the Stack

```bash
docker compose down            # Stop containers (data preserved)
docker compose down -v         # Stop and delete all volumes (wipes database)
```

### 10.5 Viewing Logs

```bash
docker compose logs -f                          # All services
docker compose logs -f user-management-api      # A specific service
```

### 10.6 nginx Reverse Proxy (Docker only)

Inside Docker, the Web Admin container runs nginx which routes API calls:

| Request path | Proxied to |
|---|---|
| `/api/auth/*` | `user-management-api:8080` |
| `/api/users/*` | `user-management-api:8080` |
| `/api/*` (all others) | `machine-tools-api:8080` |
| All other paths | Served as static React SPA |

This is configured in `docker/nginx-web-admin.conf` and is automatically mounted into the web-admin container.

### 10.7 Environment Variables

Override any setting without editing files by passing environment variables in Docker Compose or your container orchestrator.

| Variable | Service | Description |
|---|---|---|
| `ConnectionStrings__Default` | APIs, Migrators | PostgreSQL connection string |
| `ASPNETCORE_ENVIRONMENT` | APIs | `Development` or `Production` |
| `ASPNETCORE_URLS` | APIs | Kestrel binding — default `http://+:8080` |
| `App__CorsOrigins` | APIs | Comma-separated allowed origins |
| `Jwt__SecurityKey` | User Mgmt API | JWT signing secret |
| `Redis__IsEnabled` | User Mgmt API | `true` to enable Redis caching |
| `Redis__Configuration` | User Mgmt API | Redis connection string |

Example override for production:

```yaml
environment:
  ASPNETCORE_ENVIRONMENT: Production
  ConnectionStrings__Default: "Host=prod-db.example.com;Port=5432;Database=usermanagement;Username=app;Password=strongpassword"
  Jwt__SecurityKey: "YourProductionSecretKeyMustBeAtLeast32Chars!"
  App__CorsOrigins: "https://admin.yourapp.com"
```

---

## 11. Making the Application Publicly Accessible

### 11.1 Option A — Cloud VM / VPS (Recommended)

Deploy Docker Compose on a cloud VM (AWS EC2, Azure VM, DigitalOcean Droplet, etc.).

1. **Provision a VM** running Ubuntu 22.04+ with at least 2 vCPU, 4 GB RAM.

2. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

3. **Copy the project** to the VM:
   ```bash
   scp -r "Base Project/" user@your-server-ip:/home/user/baseproject
   ```
   Or clone it from a Git repository.

4. **Open firewall ports:**

   | Port | Service |
   |---|---|
   | 80 / 443 | Web Admin (nginx) |
   | 44301 | User Management API |
   | 44302 | Machine Tools API |

5. **Start the stack:**
   ```bash
   cd /home/user/baseproject
   docker compose up -d --build
   ```

### 11.2 Option B — Reverse Proxy with HTTPS (Production)

For HTTPS (required for production mobile apps), put a reverse proxy like **nginx** or **Caddy** in front of the Docker services.

**Example — Caddy (automatic HTTPS via Let's Encrypt):**

Install Caddy on the host, then create `/etc/caddy/Caddyfile`:

```
admin.yourapp.com {
    reverse_proxy localhost:3000
}

auth-api.yourapp.com {
    reverse_proxy localhost:44301
}

api.yourapp.com {
    reverse_proxy localhost:44302
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

Caddy automatically provisions and renews TLS certificates.

### 11.3 Security Considerations for Production

> **Do not use development defaults in production.**

- [ ] Replace `Jwt.SecurityKey` with a cryptographically random string (minimum 32 characters).
- [ ] Use environment-specific PostgreSQL credentials (not `postgres`/`postgres`).
- [ ] Disable the Swagger UI in production by removing OpenAPI middleware or restricting it by environment.
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production` — this disables development error pages.
- [ ] Restrict `App__CorsOrigins` to only your real frontend domains.
- [ ] Enable HTTPS everywhere and redirect HTTP to HTTPS.
- [ ] Do not commit `appsettings.json` with real credentials — use environment variables or a secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault).
- [ ] Set PostgreSQL to only listen on localhost if the APIs are on the same host.
- [ ] Remove `android:usesCleartextTraffic="true"` from `AndroidManifest.xml` for the production APK — use HTTPS only.

---

## 12. Connecting the Mobile App to the Server

### 12.1 Configuration File

All API base URLs are controlled by a single file:

**`machine-tools-management/mobile-app/src/config.ts`**

```typescript
const IS_PHYSICAL_DEVICE = true; // ← change this to switch modes

const HOST               = IS_PHYSICAL_DEVICE ? '192.168.2.44' : '10.0.2.2';
const AUTH_PORT          = IS_PHYSICAL_DEVICE ? 5001           : 44301;
const MACHINE_TOOLS_PORT = IS_PHYSICAL_DEVICE ? 5002           : 44302;
const SCHEME             = IS_PHYSICAL_DEVICE ? 'http'         : 'https';

export const Config = {
  AUTH_API_URL:          `${SCHEME}://${HOST}:${AUTH_PORT}`,
  MACHINE_TOOLS_API_URL: `${SCHEME}://${HOST}:${MACHINE_TOOLS_PORT}`,
};
```

### 12.2 Configuration per Environment

#### Android Emulator (local dev)

```typescript
const IS_PHYSICAL_DEVICE = false;
// Results in: https://10.0.2.2:44301 and https://10.0.2.2:44302
```

- `10.0.2.2` is the emulator's alias for the host machine's `localhost`.
- HTTPS works because the dev cert is trusted by the emulator.

#### Physical Device (local dev)

```typescript
const IS_PHYSICAL_DEVICE = true;
const HOST = '192.168.2.44'; // ← replace with your actual LAN IP
// Results in: http://192.168.2.44:5001 and http://192.168.2.44:5002
```

- Phone and computer must be on the same Wi-Fi network.
- HTTP is used because the self-signed dev cert is not trusted by Android.
- `android:usesCleartextTraffic="true"` in `AndroidManifest.xml` allows HTTP.

#### Production

```typescript
const HOST               = 'api.yourapp.com';
const AUTH_PORT          = 443;
const MACHINE_TOOLS_PORT = 443;
const SCHEME             = 'https';
```

Or simplify by using separate subdomains with standard HTTPS port 443:
```typescript
export const Config = {
  AUTH_API_URL:          'https://auth.yourapp.com',
  MACHINE_TOOLS_API_URL: 'https://api.yourapp.com',
};
```

After changing `config.ts`, rebuild and reinstall the app:

```bash
npx react-native run-android
```

### 12.3 Server Requirements for Physical Device Access

The backend APIs must bind to all network interfaces (not just `localhost`) to be reachable from a phone.

**User Management API** — `Properties/launchSettings.json`:
```json
"applicationUrl": "https://localhost:44301;http://*:5001"
```

**Machine Tools API** — `appsettings.Development.json`:
```json
{ "Urls": "https://localhost:44302;http://*:5002" }
```

The `*` wildcard tells Kestrel to listen on all interfaces. Without this, the server only accepts connections from the same machine.

---

## 13. Troubleshooting

### 13.1 `adb devices` shows empty list

**Symptom:** Running `adb devices` shows no devices after plugging in the phone.

**Fixes:**
1. Enable **USB Debugging** in Developer Options on the phone.
2. Change USB connection mode from **Charging only** to **File Transfer (MTP)**.
3. Accept the **Allow USB Debugging** dialog on the phone.
4. Try a different USB cable (some cables are charge-only).
5. Install the correct USB driver for your phone manufacturer (on Windows).

---

### 13.2 Mobile app cannot reach the API — Network Error

**Symptom:** Login fails with a network error or connection refused.

**Checklist:**
1. Is `config.ts` set to the correct IP and ports?
2. Is `IS_PHYSICAL_DEVICE = true`?
3. Are both API servers running?
   ```powershell
   netstat -ano | findstr ":5001 " | findstr LISTENING
   netstat -ano | findstr ":5002 " | findstr LISTENING
   ```
4. Are the APIs bound to `*` or `0.0.0.0` (not just `127.0.0.1`)?
5. Is the phone on the same Wi-Fi as the development machine?
6. Is `android:usesCleartextTraffic="true"` present in `AndroidManifest.xml`?
7. Test connectivity from the phone before building:
   - Open a browser on the phone and navigate to `http://192.168.2.44:5001/swagger`
   - If you see the Swagger UI, the API is reachable.

---

### 13.3 Machine Tools API binds to `127.0.0.1` despite `launchSettings.json`

**Symptom:** `netstat` shows `127.0.0.1:5002` instead of `0.0.0.0:5002`.

**Cause:** The `"Urls"` key in `appsettings.json` overrides `launchSettings.json`.

**Fix:** Ensure `appsettings.Development.json` contains:
```json
{
  "Urls": "https://localhost:44302;http://*:5002"
}
```
And restart the server.

---

### 13.4 `dotnet run` fails — DLL is locked by another process

**Symptom:**
```
Error MSB3027: Could not copy '...' — file is locked by: "Microsoft Visual Studio (xxxxx)"
```

**Cause:** Visual Studio is running the project and has locked the DLL.

**Fix:** Stop the project in Visual Studio (Stop Debugging), then run `dotnet run` again. Or use Visual Studio to run the project instead of the terminal.

---

### 13.5 Database migration fails — connection refused

**Symptom:** DbMigrator crashes with `Connection refused` or `database does not exist`.

**Fixes:**
1. Ensure PostgreSQL is running:
   ```powershell
   # Check if postgres is listening
   netstat -ano | findstr ":5432"
   ```
2. Verify the credentials in `appsettings.json` match your PostgreSQL setup.
3. Create the database manually if it doesn't exist:
   ```sql
   CREATE DATABASE usermanagement;
   CREATE DATABASE machinetools;
   ```

---

### 13.6 Web Admin shows blank page or proxy errors

**Symptom:** The web admin loads but API calls fail with `502 Bad Gateway` or `ECONNREFUSED`.

**Fixes:**
1. Ensure both API servers are running (ports `44301` and `44302`).
2. Check `vite.config.ts` proxy targets match the actual API ports.
3. If the dev cert is refused, the `secure: false` option in the proxy config should handle this — verify it is present.

---

### 13.7 `npm run dev` fails — port 3000 already in use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:**
```powershell
# Find and kill what's on port 3000
netstat -ano | findstr ":3000 "
Stop-Process -Id <PID> -Force
```

---

### 13.8 React Native build fails — JAVA_HOME not set

**Symptom:**
```
JAVA_HOME is not set and no 'java' command could be found
```

**Fix:** Set the `JAVA_HOME` environment variable to your JDK installation path:
```powershell
# Windows — permanent, via System Environment Variables
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "Machine")
```
Then restart your terminal.

---

### 13.9 Docker containers fail to start — port already in use

**Symptom:**
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Cause:** A local PostgreSQL instance is already using port 5432.

**Fix:** Either stop the local PostgreSQL service before starting Docker, or change the Docker host port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"   # Map to a different host port
```

---

*End of guide.*
