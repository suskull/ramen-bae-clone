# Supabase Development Workflow

## Overview

This guide covers the complete workflow for developing with Supabase, including schema changes, migrations, and syncing across environments.

## Development Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

1. LOCAL DEVELOPMENT
   ├── Make schema changes locally
   ├── Test thoroughly
   └── Create migration file
        ↓
2. MIGRATION
   ├── Generate migration SQL
   ├── Review migration
   └── Apply to local DB
        ↓
3. VERSION CONTROL
   ├── Commit migration file
   └── Push to git
        ↓
4. PRODUCTION DEPLOYMENT
   ├── Pull latest code
   ├── Review migrations
   └── Apply to production
        ↓
5. SYNC TYPES
   └── Generate TypeScript types
```

## The Golden Rule

**🔑 Always develop locally first, then deploy to production via migrations.**

### Why?
- ✅ Safe testing without affecting production
- ✅ Version-controlled schema changes
- ✅ Rollback capability
- ✅ Team collaboration
- ✅ Audit trail

## Step-by-Step Workflows

### Workflow 1: Adding a New Table

#### Step 1: Make Changes Locally

**Option A: Using Supabase Studio (Recommended for beginners)**

```bash
# 1. Start local Supabase
supabase start

# 2. Open Studio
open http://127.0.0.1:54323

# 3. Go to Table Editor → New Table
# 4. Create your table with columns, constraints, etc.
```

**Option B: Using SQL (Recommended for advanced users)**

```bash
# 1. Create migration file
supabase migration new add_user_preferences_table

# 2. Edit the migration file
# supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences_table.sql
```

```sql
-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Step 2: Apply Migration Locally

```bash
# Apply the migration
supabase migration up

# Or reset database (applies all migrations)
supabase db reset
```

#### Step 3: Test Locally

```bash
# Test your changes
pnpm dev

# Verify table exists
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "\d user_preferences"
```

#### Step 4: Generate TypeScript Types

```bash
# Generate types from local database
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

#### Step 5: Update Your Code

```typescript
// src/lib/supabase/types.ts
import { Database } from './database.types';

export type UserPreference = Database['public']['Tables']['user_preferences']['Row'];
```

#### Step 6: Commit to Git

```bash
git add supabase/migrations/
git add src/lib/supabase/
git commit -m "feat: add user preferences table"
git push origin main
```

#### Step 7: Deploy to Production

```bash
# Push migrations to production
supabase db push

# Or link and push
supabase link --project-ref your-project-ref
supabase db push
```

#### Step 8: Verify Production

```bash
# Check production database
supabase db remote --project-ref your-project-ref

# Or test via API
curl https://your-project.supabase.co/rest/v1/user_preferences \
  -H "apikey: your-anon-key"
```

---

### Workflow 2: Modifying Existing Table

#### Example: Adding a Column

```bash
# 1. Create migration
supabase migration new add_avatar_url_to_user_preferences

# 2. Edit migration file
```

```sql
-- Add avatar_url column
ALTER TABLE user_preferences 
ADD COLUMN avatar_url TEXT;

-- Add index if needed
CREATE INDEX idx_user_preferences_user_id 
ON user_preferences(user_id);
```

```bash
# 3. Apply locally
supabase migration up

# 4. Test
pnpm dev

# 5. Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 6. Commit and push
git add supabase/migrations/
git commit -m "feat: add avatar_url to user preferences"
git push

# 7. Deploy to production
supabase db push
```

---

### Workflow 3: Changing Column Type

```bash
# 1. Create migration
supabase migration new change_price_to_integer

# 2. Edit migration file
```

```sql
-- Change price from DECIMAL to INTEGER (cents)
-- Step 1: Add new column
ALTER TABLE products ADD COLUMN price_cents INTEGER;

-- Step 2: Migrate data
UPDATE products SET price_cents = (price * 100)::INTEGER;

-- Step 3: Drop old column
ALTER TABLE products DROP COLUMN price;

-- Step 4: Rename new column
ALTER TABLE products RENAME COLUMN price_cents TO price;

-- Step 5: Add NOT NULL constraint
ALTER TABLE products ALTER COLUMN price SET NOT NULL;
```

```bash
# 3. Apply and test locally
supabase db reset
pnpm dev

# 4. Update TypeScript types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 5. Update code to use cents instead of dollars
# 6. Commit and deploy
git add .
git commit -m "refactor: change price to integer (cents)"
git push
supabase db push
```

---

### Workflow 4: Adding RLS Policies

```bash
# 1. Create migration
supabase migration new add_rls_policies_to_reviews

# 2. Edit migration file
```

```sql
-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
```

```bash
# 3. Apply and test
supabase migration up
pnpm dev

# 4. Test RLS policies
# Try accessing as different users

# 5. Deploy
git add supabase/migrations/
git commit -m "security: add RLS policies to reviews"
git push
supabase db push
```

---

### Workflow 5: Creating Database Functions

```bash
# 1. Create migration
supabase migration new add_search_products_function

# 2. Edit migration file
```

```sql
-- Create full-text search function
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM products p
  WHERE 
    to_tsvector('english', p.name || ' ' || COALESCE(p.description, ''))
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

```bash
# 3. Apply and test
supabase migration up

# Test function
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "SELECT * FROM search_products('ramen');"

# 4. Deploy
git add supabase/migrations/
git commit -m "feat: add product search function"
git push
supabase db push
```

---

## Common Scenarios

### Scenario 1: Team Member Pulls Latest Code

```bash
# 1. Pull latest code
git pull origin main

# 2. Apply new migrations locally
supabase migration up

# Or reset to apply all migrations
supabase db reset

# 3. Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 4. Install dependencies (if package.json changed)
pnpm install

# 5. Start dev server
pnpm dev
```

### Scenario 2: Fixing a Migration Error

```bash
# If migration fails locally:

# 1. Fix the migration file
# Edit supabase/migrations/YYYYMMDDHHMMSS_your_migration.sql

# 2. Reset database
supabase db reset

# 3. Test again
pnpm dev

# If migration already pushed to production:

# 1. Create a new migration to fix it
supabase migration new fix_previous_migration

# 2. Write corrective SQL
# 3. Apply locally and test
# 4. Push to production
supabase db push
```

### Scenario 3: Rolling Back a Migration

```bash
# Create a rollback migration
supabase migration new rollback_user_preferences

# Write reverse SQL
```

```sql
-- Rollback: Remove user_preferences table
DROP TABLE IF EXISTS user_preferences CASCADE;
```

```bash
# Apply locally
supabase migration up

# Test
pnpm dev

# Deploy
supabase db push
```

### Scenario 4: Syncing Data Between Environments

```bash
# Export data from local
node docs/database-migration/scripts/export-local-data.js

# Import to production
# Copy exports/production_import.sql to Supabase Dashboard SQL Editor
# Run it

# Or use CLI (if you have production credentials)
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" \
  < docs/database-migration/exports/production_import.sql
```

---

## Best Practices

### 1. **Always Use Migrations**

❌ **Don't:**
```bash
# Making changes directly in production Studio
# Manual SQL in production without migration file
```

✅ **Do:**
```bash
# Create migration file
supabase migration new descriptive_name
# Edit migration
# Test locally
# Commit to git
# Deploy via supabase db push
```

### 2. **Small, Incremental Changes**

❌ **Don't:**
```sql
-- One huge migration with 10 table changes
CREATE TABLE users...
CREATE TABLE products...
CREATE TABLE orders...
-- 500 lines of SQL
```

✅ **Do:**
```bash
# Multiple focused migrations
supabase migration new create_users_table
supabase migration new create_products_table
supabase migration new create_orders_table
```

### 3. **Test Locally First**

```bash
# Always test locally before production
supabase db reset  # Apply all migrations
pnpm dev           # Test application
# Manual testing
# Automated tests
# Then deploy
```

### 4. **Generate Types After Schema Changes**

```bash
# After any schema change
supabase gen types typescript --local > src/lib/supabase/database.types.ts
git add src/lib/supabase/
git commit -m "chore: update database types"
```

### 5. **Use Descriptive Migration Names**

❌ **Don't:**
```bash
supabase migration new update
supabase migration new fix
supabase migration new changes
```

✅ **Do:**
```bash
supabase migration new add_email_to_users
supabase migration new create_reviews_table
supabase migration new add_index_to_products_category
```

### 6. **Include Rollback Strategy**

```sql
-- Migration: add_status_to_orders.sql

-- Forward migration
ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';

-- Rollback (in comments for reference)
-- ALTER TABLE orders DROP COLUMN status;
```

### 7. **Document Complex Migrations**

```sql
-- Migration: migrate_prices_to_cents.sql
-- 
-- Purpose: Change price storage from DECIMAL to INTEGER (cents)
-- Reason: Avoid floating point precision issues
-- Impact: All prices will be multiplied by 100
-- Rollback: Create reverse migration to divide by 100
--

-- Step 1: Add new column
ALTER TABLE products ADD COLUMN price_cents INTEGER;

-- Step 2: Migrate data (price in dollars → cents)
UPDATE products SET price_cents = (price * 100)::INTEGER;

-- Step 3: Verify data
-- SELECT name, price, price_cents FROM products LIMIT 5;

-- Step 4: Drop old column
ALTER TABLE products DROP COLUMN price;

-- Step 5: Rename
ALTER TABLE products RENAME COLUMN price_cents TO price;
```

---

## Troubleshooting

### Migration Fails Locally

```bash
# Check error message
supabase migration up

# Fix migration file
# Edit supabase/migrations/YYYYMMDDHHMMSS_your_migration.sql

# Reset and try again
supabase db reset
```

### Migration Fails in Production

```bash
# Check production logs
supabase logs --project-ref your-project-ref

# Create fix migration
supabase migration new fix_production_issue

# Test locally
supabase db reset

# Deploy fix
supabase db push
```

### Types Out of Sync

```bash
# Regenerate types from local
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Or from production
supabase gen types typescript --project-ref your-project-ref > src/lib/supabase/database.types.ts
```

### Local and Production Out of Sync

```bash
# Pull production schema
supabase db pull

# This creates migrations to match production
# Review the generated migrations
# Apply locally
supabase db reset
```

---

## Quick Reference

### Common Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Create migration
supabase migration new migration_name

# Apply migrations
supabase migration up

# Reset database (apply all migrations)
supabase db reset

# Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Push to production
supabase db push

# Pull from production
supabase db pull

# Check status
supabase status

# View logs
supabase logs
```

### Migration Template

```sql
-- Migration: YYYYMMDDHHMMSS_descriptive_name.sql
-- Purpose: [What this migration does]
-- Impact: [What will change]

-- Your SQL here
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE example ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "policy_name" ON example FOR SELECT USING (true);
```

---

## Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Database Migration Guide](./database-migration/README.md)

---

**Follow this workflow for safe, version-controlled database changes!** 🚀
