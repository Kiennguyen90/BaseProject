# User Management Service

## dotnet tool restore
## dotnet ef database update (requires PostgreSQL)

## Build
```bash
dotnet build
```

## Run
```bash
dotnet run --project src/BaseProject.UserManagement.HttpApi.Host
```

## Migrations
```bash
cd src/BaseProject.UserManagement.EntityFrameworkCore
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Default Admin
- Username: admin
- Password: Admin@123456
- Phone: 0900000000

## API Documentation
Navigate to https://localhost:44301/swagger
