-- =============================================================
-- PostgreSQL init script — creates both databases on first run
-- =============================================================

-- Database for User Management (ABP Identity)
SELECT 'CREATE DATABASE "BaseProject_UserManagement"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'BaseProject_UserManagement')\gexec

-- Database for Machine Tools Management
SELECT 'CREATE DATABASE "machinetools"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'machinetools')\gexec
