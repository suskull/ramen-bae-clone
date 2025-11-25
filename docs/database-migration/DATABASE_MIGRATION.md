# Database Migration & Sync

## 🚀 Quick Start: Sync to Production

**New to syncing?** Start here: **[`docs/SYNC_TO_PRODUCTION.md`](docs/SYNC_TO_PRODUCTION.md)**

**Quick reference:** [`SYNC_QUICK_REFERENCE.md`](SYNC_QUICK_REFERENCE.md)

**Visual guide:** [`docs/SYNC_WORKFLOW_DIAGRAM.md`](docs/SYNC_WORKFLOW_DIAGRAM.md)

---

## 📚 Documentation

### For Syncing Data
- **Step-by-Step Guide:** `docs/SYNC_TO_PRODUCTION.md` ⭐ **Start here**
- **Quick Reference:** `SYNC_QUICK_REFERENCE.md`
- **Visual Workflow:** `docs/SYNC_WORKFLOW_DIAGRAM.md`
- **Data Sync Guide:** `docs/database-migration/DATA_SYNC_GUIDE.md`

### For Schema Changes
- **Import Data to Production:** `docs/database-migration/FIXED_IMPORT_GUIDE.md`
- **Migration Guide:** `docs/database-migration/MIGRATION_GUIDE.md`
- **Main Import File:** `docs/database-migration/exports/production_import.sql`

### For Product Seeding
- **Seeding Workflow:** `docs/SEEDING_WORKFLOW.md`
- **Products Page Features:** `docs/products-page-features.md`

---

## ⚡ Quick Commands

### Sync Local → Production
```bash
# 1. Export data
node docs/database-migration/scripts/export-local-data.js

# 2. Upload images (via Supabase Dashboard or CLI)
# See docs/SYNC_TO_PRODUCTION.md for details

# 3. Import SQL (via Supabase SQL Editor)
# Copy/paste production_import.sql
```

### Local Development
```bash
# Seed products + generate images
./scripts/seed-and-generate-images.sh

# Or run separately
npx tsx scripts/seed-more-products.ts
node scripts/create-missing-images.js

# Export for production
node docs/database-migration/scripts/export-local-data.js
```

### Verification
```bash
# Check local products count
curl -s "http://localhost:3000/api/products" | jq '.total'

# Check production products count
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/products?select=count" \
  -H "apikey: YOUR_ANON_KEY"
```

### Schema Migrations
```bash
# Create new migration
supabase migration new descriptive_name

# Apply migrations locally
supabase db reset

# Push to production
supabase db push
```

---

## 📊 Current Status

**Local Database:**
- ✅ 5 Categories
- ✅ 57 Products
- ✅ 114 Product Images (SVG)
- ✅ Reviews
- ✅ Infinite Scroll + Pagination

**Production Database:**
- ⏳ Awaiting sync (follow docs/SYNC_TO_PRODUCTION.md)

---

## 🎯 Common Tasks

### I want to sync my local data to production
→ Follow **[`docs/SYNC_TO_PRODUCTION.md`](docs/SYNC_TO_PRODUCTION.md)**

### I want to add more products locally
→ Run `./scripts/seed-and-generate-images.sh`

### I want to change the database schema
→ See `docs/database-migration/MIGRATION_GUIDE.md`

### I want to verify production data
→ Run `./docs/database-migration/scripts/verify-production-data.sh`

---

## 📁 File Structure

```
.
├── DATABASE_MIGRATION.md (this file)
├── SYNC_QUICK_REFERENCE.md (quick commands)
├── docs/
│   ├── SYNC_TO_PRODUCTION.md (⭐ main guide)
│   ├── SYNC_WORKFLOW_DIAGRAM.md (visual guide)
│   ├── SEEDING_WORKFLOW.md (product seeding)
│   ├── products-page-features.md (features docs)
│   └── database-migration/
│       ├── DATA_SYNC_GUIDE.md
│       ├── FIXED_IMPORT_GUIDE.md
│       ├── MIGRATION_GUIDE.md
│       └── scripts/
│           └── export-local-data.js
├── scripts/
│   ├── seed-more-products.ts
│   ├── create-missing-images.js
│   ├── seed-and-generate-images.sh
│   └── README.md
└── production_import.sql (generated)
```

---

## 🆘 Need Help?

1. **Check the guides** - Most questions are answered in the docs
2. **Review troubleshooting** - Each guide has a troubleshooting section
3. **Check file structure** - Make sure you're in the right directory
4. **Verify credentials** - Ensure .env.local is configured correctly

---

See `docs/database-migration/README.md` for complete documentation.
