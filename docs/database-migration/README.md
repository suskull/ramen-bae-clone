# Database Migration & Sync Documentation

This folder contains all database migration, sync, and seeding tools created during the project setup.

## 📁 Folder Structure

```
docs/database-migration/
├── README.md                           # This file
├── FIXED_IMPORT_GUIDE.md              # Quick start guide for importing data
├── DATA_SYNC_GUIDE.md                 # Complete data sync workflow
├── MIGRATION_GUIDE.md                 # Migration best practices
├── PRODUCTION_SEEDING_GUIDE.md        # Production seeding instructions
├── IMPORT_NOW.md                      # Quick import steps
├── RESET_PRODUCTION.sql               # SQL to reset production database
├── exports/                           # Exported data files
│   ├── production_import.sql          # Ready-to-import SQL (MAIN FILE)
│   ├── local_data_export.sql          # Full database dump
│   ├── backup_local_schema.sql        # Schema backup
│   ├── categories_export.csv          # Categories in CSV
│   └── products_export.csv            # Products in CSV
├── scripts/                           # Utility scripts
│   ├── export-local-data.js           # Export data from local DB
│   ├── verify-production-data.sh      # Verify production data
│   ├── seed-production.sql            # Manual seed SQL
│   ├── sync-production-schema.sql     # Schema sync SQL
│   ├── create-missing-images.js       # Generate placeholder images
│   └── generate-placeholder-images.js # Image generation script
└── migrations_backup/                 # Old migration files (reference)
```

## 🚀 Quick Start

### Import Data to Production

1. **Open Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/sql/new
   ```

2. **Copy SQL:**
   - Open `exports/production_import.sql`
   - Copy all content

3. **Run:**
   - Paste in SQL Editor
   - Click "Run"

4. **Verify:**
   ```bash
   ./scripts/verify-production-data.sh
   ```

## 📚 Documentation Files

### FIXED_IMPORT_GUIDE.md
- **Purpose:** Quick reference for importing data
- **Use when:** Ready to import data to production
- **Contains:** Step-by-step import instructions

### DATA_SYNC_GUIDE.md
- **Purpose:** Complete workflow for syncing local → production
- **Use when:** Need to understand the full sync process
- **Contains:** Export/import workflow, troubleshooting

### MIGRATION_GUIDE.md
- **Purpose:** Best practices for database migrations
- **Use when:** Making schema changes
- **Contains:** Migration workflow, examples, tips

### PRODUCTION_SEEDING_GUIDE.md
- **Purpose:** Guide for seeding production database
- **Use when:** First-time production setup
- **Contains:** Seeding instructions, verification steps

## 🛠️ Scripts

### export-local-data.js
**Purpose:** Export data from local database to SQL file

**Usage:**
```bash
node docs/database-migration/scripts/export-local-data.js
```

**Output:** `exports/production_import.sql`

**What it does:**
- Exports categories, products, reviews
- Generates INSERT statements with ON CONFLICT
- Handles arrays and JSONB correctly

### verify-production-data.sh
**Purpose:** Verify data in production database

**Usage:**
```bash
./docs/database-migration/scripts/verify-production-data.sh
```

**Checks:**
- Category count (should be 5)
- Product count (should be 9)
- Sample category filtering
- API endpoint responses

### create-missing-images.js
**Purpose:** Generate placeholder SVG images for products

**Usage:**
```bash
node docs/database-migration/scripts/create-missing-images.js
```

**Output:** Creates SVG files in `public/products/`

## 📊 Data Files

### production_import.sql (MAIN FILE)
- **Location:** `exports/production_import.sql`
- **Purpose:** Ready-to-run SQL for production import
- **Contains:** 5 categories, 9 products, 7 reviews
- **Format:** INSERT statements with ON CONFLICT clauses

### local_data_export.sql
- **Location:** `exports/local_data_export.sql`
- **Purpose:** Full database dump (backup)
- **Contains:** All tables including auth tables

### backup_local_schema.sql
- **Location:** `exports/backup_local_schema.sql`
- **Purpose:** Schema-only backup
- **Contains:** Table definitions, indexes, policies

## 🔄 Common Workflows

### 1. Sync Data from Local to Production

```bash
# 1. Export from local
node docs/database-migration/scripts/export-local-data.js

# 2. Import to production (via Supabase Dashboard)
# Copy exports/production_import.sql → SQL Editor → Run

# 3. Verify
./docs/database-migration/scripts/verify-production-data.sh
```

### 2. Reset Production Database

```bash
# 1. Run reset SQL in Supabase Dashboard
# Copy RESET_PRODUCTION.sql → SQL Editor → Run

# 2. Push schema
supabase db push

# 3. Import data
# Copy exports/production_import.sql → SQL Editor → Run
```

### 3. Create New Migration

```bash
# 1. Create migration
supabase migration new descriptive_name

# 2. Edit migration file in supabase/migrations/

# 3. Test locally
supabase db reset

# 4. Push to production
supabase db push
```

## ⚠️ Important Notes

### Data Types
- **Text arrays:** `ARRAY['item1','item2']` (tags, ingredients, allergens, features)
- **JSONB arrays:** `'[{...}]'::jsonb` (images, media)
- **JSONB objects:** `'{...}'::jsonb` (nutrition_facts)

### UUID Functions
- Always use: `extensions.uuid_generate_v4()`
- Not: `uuid_generate_v4()`

### Migration Best Practices
- Small, incremental changes
- Test locally first
- Use descriptive names
- Include rollback strategy

## 🗑️ Cleanup

These files are kept for reference but can be deleted if not needed:

- `migrations_backup/` - Old migration files
- `exports/*.csv` - CSV exports (if not using)
- `local_data_export.sql` - Full dump (if not needed)

**Keep these:**
- `exports/production_import.sql` - Main import file
- `scripts/export-local-data.js` - Reusable export script
- `scripts/verify-production-data.sh` - Verification script
- All documentation files

## 📝 Maintenance

### Re-export Data
When you update local data and want to sync to production:

```bash
node docs/database-migration/scripts/export-local-data.js
# Then import exports/production_import.sql to production
```

### Update Documentation
If you make changes to the workflow, update the relevant markdown files in this folder.

---

**All database migration and sync tools are now organized in this folder!**
