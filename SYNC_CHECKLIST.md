# ✅ Production Sync Checklist

Print this or keep it open while syncing to production.

---

## Pre-Sync Verification

- [ ] Local database has all products (check: `curl -s "http://localhost:3000/api/products" | jq '.total'`)
- [ ] All product images exist in `public/products/` (check: `ls public/products/*.svg | wc -l`)
- [ ] Dev server runs without errors
- [ ] Products page works locally at `/products`
- [ ] Infinite scroll works
- [ ] Category filtering works
- [ ] You have Supabase dashboard access
- [ ] You have production database credentials (if using CLI)

**Expected counts:**
- Products: 57
- Images: 114 (.svg files)
- Categories: 5

---

## Step 1: Export Database ⏱️ 1 min

- [ ] Run: `node docs/database-migration/scripts/export-local-data.js`
- [ ] Verify output shows:
  - [ ] ✅ Found 5 rows (categories)
  - [ ] ✅ Found 57 rows (products)
  - [ ] ✅ Found X rows (reviews)
- [ ] File created: `production_import.sql`
- [ ] File size is reasonable (check: `ls -lh production_import.sql`)

**Checkpoint:** File should be 100KB+ in size

---

## Step 2: Upload Images ⏱️ 3-5 min

### Choose Method:

#### Option A: Supabase Dashboard (Easier)
- [ ] Go to: https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/storage/buckets/product-images
- [ ] Navigate to `products` folder (create if needed)
- [ ] Click "Upload files"
- [ ] Select all files from `public/products/*.svg`
- [ ] Wait for upload to complete
- [ ] Verify: Should see 114 files

#### Option B: CLI (Faster)
- [ ] Run: `supabase login`
- [ ] Run: `supabase link --project-ref nfydvfhrepavcyclzfrh`
- [ ] Run: `supabase storage cp public/products/*.svg supabase://product-images/products/`
- [ ] Verify upload completed

**Checkpoint:** All 114 .svg files visible in Supabase Storage

---

## Step 3: Import Database ⏱️ 1 min

- [ ] Go to: https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/sql
- [ ] Click "New query"
- [ ] Open `production_import.sql` in editor
- [ ] Select all (Cmd+A / Ctrl+A)
- [ ] Copy (Cmd+C / Ctrl+C)
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or Cmd+Enter / Ctrl+Enter)
- [ ] Wait for completion (5-10 seconds)
- [ ] Check for success message

**Checkpoint:** Should see "Success" or "X rows affected"

---

## Step 4: Verify Production ⏱️ 2 min

### Via Dashboard
- [ ] Go to: Table Editor → products
- [ ] Verify: Shows 57 rows
- [ ] Click on a product
- [ ] Verify: `images` field has correct paths
- [ ] Go to: Storage → product-images → products
- [ ] Verify: Shows 114 .svg files

### Via API (Optional)
```bash
# Check categories
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/categories?select=count" \
  -H "apikey: YOUR_ANON_KEY"
# Should return: 5

# Check products
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/products?select=count" \
  -H "apikey: YOUR_ANON_KEY"
# Should return: 57
```

- [ ] Categories count: 5
- [ ] Products count: 57

### Via Your App
- [ ] Update `.env.local` to use production URL temporarily
- [ ] Restart dev server: `pnpm run dev`
- [ ] Visit: http://localhost:3000/products
- [ ] Verify: All 57 products appear
- [ ] Verify: Images load correctly
- [ ] Verify: Infinite scroll works
- [ ] Verify: Category filtering works
- [ ] Restore `.env.local` to local URL

**Checkpoint:** Everything works with production database

---

## Step 5: Deploy ⏱️ 2-3 min

- [ ] Commit changes: `git add .`
- [ ] Commit: `git commit -m "Add 48 new products with images and infinite scroll"`
- [ ] Push: `git push origin main`
- [ ] Wait for Vercel deployment
- [ ] Visit production URL
- [ ] Test products page
- [ ] Verify all features work

**Checkpoint:** Production site shows all 57 products

---

## Post-Sync Verification

- [ ] Production site loads without errors
- [ ] Products page shows 57 products
- [ ] Images load correctly (no 404s)
- [ ] Infinite scroll works
- [ ] Pagination toggle works
- [ ] Category filtering works
- [ ] Product detail pages work
- [ ] No console errors
- [ ] Performance is acceptable

---

## Rollback Plan (If Needed)

If something goes wrong:

### Database Rollback
- [ ] Go to Supabase SQL Editor
- [ ] Run: `DELETE FROM products WHERE created_at > '2025-11-07 08:00:00';`
- [ ] Or restore from backup

### Image Rollback
- [ ] Go to Supabase Storage
- [ ] Delete uploaded files
- [ ] Or keep them (they're harmless)

### Code Rollback
- [ ] Run: `git revert HEAD`
- [ ] Push: `git push origin main`

---

## Troubleshooting

### Images not showing
- [ ] Check browser console for 404 errors
- [ ] Verify images uploaded to correct path
- [ ] Check storage bucket is public
- [ ] Verify image URLs in database

### Data not appearing
- [ ] Verify SQL import succeeded
- [ ] Check you're querying production database
- [ ] Clear browser cache
- [ ] Check RLS policies

### Import errors
- [ ] Check database credentials
- [ ] Verify SQL syntax
- [ ] Check for conflicting data
- [ ] Review error message

---

## Success Criteria

✅ **Sync is successful when:**
- Production database has 57 products
- All 114 images are accessible
- Production site displays all products
- All features work correctly
- No errors in console
- Performance is good

---

## Time Tracking

| Step | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Export | 1 min | ___ | |
| Upload Images | 3-5 min | ___ | |
| Import SQL | 1 min | ___ | |
| Verify | 2 min | ___ | |
| Deploy | 2-3 min | ___ | |
| **Total** | **10-15 min** | ___ | |

---

## Notes

Use this space for any issues or observations:

```
Date: _______________
Time Started: _______________
Time Completed: _______________

Issues encountered:




Solutions applied:




```

---

## Next Sync

When you need to sync again:
1. Add products locally
2. Run: `./scripts/seed-and-generate-images.sh`
3. Follow this checklist again
4. Should be faster (only new images to upload)

---

**Need help?** See `docs/SYNC_TO_PRODUCTION.md` for detailed instructions.
