-- ============================================================================
-- PHASE 0 CLEANUP — drop legacy jewelry-shop tables and columns
-- ============================================================================
-- Run this ONCE manually against the Postgres DB after pulling Phase 0.
-- Hibernate's ddl-auto=update will not drop tables/columns automatically,
-- so leftover schema must be removed by hand.
--
-- Usage:
--   psql "$SPRING_DATASOURCE_URL" -f cleanup.sql
--
-- Safe to re-run — every statement is IF EXISTS.
-- ============================================================================

-- Jewelry domain tables
DROP TABLE IF EXISTS sales_loans      CASCADE;
DROP TABLE IF EXISTS payments         CASCADE;
DROP TABLE IF EXISTS inventory_items  CASCADE;
DROP TABLE IF EXISTS categories       CASCADE;
DROP TABLE IF EXISTS clients          CASCADE;
DROP TABLE IF EXISTS stores           CASCADE;
DROP TABLE IF EXISTS timesheets       CASCADE;

-- Auth: legacy custom-role table (sales/inventory permissions)
DROP TABLE IF EXISTS custom_roles     CASCADE;

-- AppUser: drop legacy multi-tenant + custom-role columns
ALTER TABLE app_users DROP COLUMN IF EXISTS client_id;
ALTER TABLE app_users DROP COLUMN IF EXISTS allowed_stores;

-- ActivityLog: drop legacy store_id column
ALTER TABLE activity_logs DROP COLUMN IF EXISTS store_id;
