# Production Data Seeding Guide

## ✅ Schema Successfully Synced!

Your production database now has the correct schema matching local.

## Next Step: Seed Production Data

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: `nfydvfhrepavcyclzfrh`
3. Go to **SQL Editor**
4. Copy and paste the content from `scripts/seed-production.sql`
5. Click **Run**

### Option 2: Via Command Line

```bash
# Get your production database password from Supabase Dashboard
# Settings → Database → Connection string

psql "postgresql://postgres:[YOUR_PASSWORD]@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres" \
  < scripts/seed-production.sql
```

### Verify After Seeding:

```bash
# Should return 5 categories
curl -s "http://localhost:3000/api/categories" | jq '.categories | length'

# Should return 9 products
curl -s "http://localhost:3000/api/products" | jq '.products | length'
```

## What Got Fixed:

1. ✅ **Schema Sync**: Production now matches local exactly
2. ✅ **Migration History**: Clean single migration
3. ✅ **UUID Extension**: Fixed to use `extensions.uuid_generate_v4()`
4. ⏳ **Data**: Needs to be seeded (next step)

## Going Forward:

Always use this workflow for schema changes:

```bash
# 1. Create migration
supabase migration new add_something

# 2. Edit migration file
# 3. Test locally
supabase db reset

# 4. Push to production
supabase db push
```

Your local and production databases are now in perfect sync! 🎉
