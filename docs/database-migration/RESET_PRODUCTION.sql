-- ============================================================================
-- PRODUCTION DATABASE RESET SCRIPT
-- ============================================================================
-- WARNING: This will delete all data and reset the schema
-- Only run this if you're okay with losing production data
-- ============================================================================

-- Step 1: Clear migration history
TRUNCATE supabase_migrations.schema_migrations;

-- Step 2: Drop all application tables
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Step 3: Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- After running this script:
-- 1. Run: supabase db push
-- 2. This will apply the clean migration: 20251107035928_initial_schema.sql
-- 3. Then seed data with: scripts/seed-production.sql
-- ============================================================================