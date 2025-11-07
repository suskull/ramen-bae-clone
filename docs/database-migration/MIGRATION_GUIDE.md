# Production Migration Reset Guide

## Current Status
- ✅ Local database has clean schema with single migration
- ⚠️ Production needs migration history reset

## Steps to Sync Production

### Option 1: Reset Production Migration History (Recommended)

**Run these commands in Supabase SQL Editor (Production):**

```sql
-- 1. Clear migration history table
TRUNCATE supabase_migrations.schema_migrations;

-- 2. Drop all existing tables (CAREFUL - this deletes data!)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 3. Now run: supabase db push
-- This will apply the clean migration from local
```

### Option 2: Manual Schema Sync (If you want to keep production data)

**Run the migration file directly in Supabase SQL Editor:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy content from `supabase/migrations/20251107035928_initial_schema.sql`
5. Paste and run

Then update migration history:
```sql
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('20251107035928', 'initial_schema', ARRAY['-- migration applied manually']);
```

### Option 3: Use Supabase CLI Reset (If available)

```bash
# This resets production database (DESTRUCTIVE!)
supabase db reset --linked

# Then push migrations
supabase db push
```

## After Sync

### Verify Schema Match:
```bash
# Check local
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\d categories"

# Check production (via API)
curl -s "http://localhost:3000/api/categories" | jq '.'
```

### Seed Production Data:
```bash
# Run the seed script
psql "postgresql://postgres:[PASSWORD]@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres" < scripts/seed-production.sql
```

## Going Forward

### Always use this workflow:
```bash
# 1. Create migration locally
supabase migration new descriptive_name

# 2. Edit migration file with specific changes
# 3. Apply locally
supabase db reset  # or supabase migration up

# 4. Test locally
# 5. Push to production
supabase db push
```

## Current Migration Files

- ✅ `20251107035928_initial_schema.sql` - Complete schema with all tables
- 📦 `supabase/migrations_backup/` - Old migrations (for reference only)

## Notes

- Local and production will now have identical schemas
- Single source of truth: `supabase/migrations/20251107035928_initial_schema.sql`
- All future changes should be incremental migrations
