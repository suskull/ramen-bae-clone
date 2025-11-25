# 🚀 Quick Reference: Sync to Production

## One-Time Setup (First Sync)

```bash
# 1. Export database
node docs/database-migration/scripts/export-local-data.js

# 2. Upload images (choose one method)
# Method A: Manual upload via Supabase Dashboard
# - Go to Storage → product-images → Upload files
# - Select all from public/products/*.svg

# Method B: CLI (faster)
supabase login
supabase link --project-ref nfydvfhrepavcyclzfrh
supabase storage cp public/products/*.svg supabase://product-images/products/

# 3. Import data
# - Open Supabase Dashboard → SQL Editor
# - Copy/paste content from production_import.sql
# - Click Run

# 4. Verify
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/products?select=count" \
  -H "apikey: YOUR_ANON_KEY"
```

## Regular Updates (Adding More Products)

```bash
# 1. Add products locally
npx tsx scripts/seed-more-products.ts
node scripts/create-missing-images.js

# 2. Export
node docs/database-migration/scripts/export-local-data.js

# 3. Upload new images only
# Upload new .svg files to Supabase Storage

# 4. Import
# Run production_import.sql in SQL Editor

# 5. Deploy
git add . && git commit -m "Update products" && git push
```

## Quick Commands

```bash
# Seed products + images (local)
./scripts/seed-and-generate-images.sh

# Export to SQL
node docs/database-migration/scripts/export-local-data.js

# Check local products count
curl -s "http://localhost:3000/api/products" | jq '.total'

# Check production products count
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/products?select=count" \
  -H "apikey: YOUR_ANON_KEY"
```

## Important URLs

- **Supabase Dashboard:** https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh
- **SQL Editor:** https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/sql
- **Storage:** https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/storage/buckets

## Files to Know

- `production_import.sql` - Generated SQL for import
- `public/products/*.svg` - Product images to upload
- `.env.local` - Database connection config

## Detailed Guide

See **`docs/SYNC_TO_PRODUCTION.md`** for complete step-by-step instructions.
