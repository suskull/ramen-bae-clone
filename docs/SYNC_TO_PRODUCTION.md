# Step-by-Step Guide: Sync Local Data to Production

## 📋 Overview

You have **57 products** with **114 SVG images** in your local database that need to be synced to production.

**What we'll sync:**
- ✅ 5 Categories
- ✅ 57 Products (9 original + 48 new)
- ✅ Product images (SVG files)
- ✅ Reviews (if any)

**Estimated time:** 10-15 minutes

---

## 🎯 Step 1: Export Local Database Data

Export all your local data to a SQL file.

```bash
node docs/database-migration/scripts/export-local-data.js
```

**Expected output:**
```
🔄 Exporting data from local database...

📦 Exporting categories...
   ✅ Found 5 rows
📦 Exporting products...
   ✅ Found 57 rows
📦 Exporting reviews...
   ✅ Found X rows
📦 Exporting carts...
   ⚠️  No data in carts
📦 Exporting cart_items...
   ⚠️  No data in cart_items

✅ Export complete!
📄 File created: production_import.sql
```

**✅ Checkpoint:** Verify the file was created:
```bash
ls -lh production_import.sql
```

---

## 🖼️ Step 2: Upload Product Images to Production

You need to upload the SVG images to Supabase Storage.

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh
   - Navigate to: **Storage** → **product-images** bucket

2. **Create folder structure** (if not exists)
   - Create folder: `products`

3. **Upload images**
   - Click **Upload files**
   - Select all files from: `public/products/*.svg`
   - Upload all 114 SVG files
   - This may take 2-3 minutes

### Option B: Using Supabase CLI (Faster for many files)

```bash
# Install Supabase CLI if not already installed
# brew install supabase/tap/supabase  # macOS
# npm install -g supabase              # npm

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref nfydvfhrepavcyclzfrh

# Upload all images
supabase storage cp public/products/*.svg \
  supabase://product-images/products/ \
  --recursive
```

**✅ Checkpoint:** Verify images uploaded:
- Go to Storage → product-images → products
- Should see 114 .svg files

---

## 💾 Step 3: Import Data to Production Database

⚠️ **IMPORTANT WARNING:** The SQL script will **DELETE ALL existing products, categories, and reviews** before inserting new data. This ensures a clean sync without duplicates.

### Optional: Backup Production Data First

If you want to be extra safe, backup production data before importing:

```bash
# Requires psql and pg_dump installed
./scripts/backup-production-data.sh YOUR_DATABASE_PASSWORD

# This creates: production_backup_YYYYMMDD_HHMMSS.sql
# You can restore it later if needed
```

---

**What gets deleted:**
- All products
- All categories  
- All reviews
- All carts and cart items

**What stays safe:**
- User accounts
- Orders
- Other tables not in the sync

Now import the database data.

### Method 1: Supabase Dashboard SQL Editor (Easiest)

1. **Open SQL Editor**
   - Go to: https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/sql
   - Click **New query**

2. **Copy SQL content**
   ```bash
   # Open the file in your editor
   cat production_import.sql
   ```
   - Or open `production_import.sql` in VS Code
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **⚠️ REVIEW BEFORE RUNNING**
   - The script starts with DELETE statements
   - Make sure you have a backup if needed
   - Verify you're in the correct database
   - This action cannot be easily undone

4. **Paste and Run**
   - Paste into SQL Editor
   - Click **Run** (or Cmd+Enter / Ctrl+Enter)
   - Wait for completion (5-10 seconds)

5. **Check for success**
   - Should see: "DELETE X" messages first
   - Then: "INSERT X" messages
   - Total: 5 categories + 57 products + 7 reviews = 69 rows inserted

### Method 2: Command Line (Advanced)

**Get your database password:**
- Dashboard → Settings → Database → Database Password
- Click "Reset database password" if needed

**Run import:**
```bash
# Replace [YOUR_PASSWORD] with actual password
psql "postgresql://postgres:[YOUR_PASSWORD]@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres" \
  < production_import.sql
```

**✅ Checkpoint:** Should see output like:
```
SET
DELETE 5
DELETE 57
DELETE 7
INSERT 0 5
INSERT 0 57
INSERT 0 7
INSERT 0 X
```

---

## ✅ Step 4: Verify Production Data

Test that everything synced correctly.

### Check via API

```bash
# Check categories (should return 5)
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/categories?select=*" \
  -H "apikey: YOUR_ANON_KEY" | jq 'length'

# Check products (should return 57)
curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/products?select=*" \
  -H "apikey: YOUR_ANON_KEY" | jq 'length'
```

### Check via Dashboard

1. **Table Editor**
   - Go to: Table Editor → products
   - Should see 57 rows
   - Click on a product to verify images field has correct paths

2. **Storage**
   - Go to: Storage → product-images → products
   - Should see all 114 .svg files

### Check via Your App

1. **Update .env.local** (temporarily for testing)
   ```bash
   # Comment out local, use production
   # NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_URL=https://nfydvfhrepavcyclzfrh.supabase.co
   ```

2. **Restart dev server**
   ```bash
   pnpm run dev
   ```

3. **Visit products page**
   - Go to: http://localhost:3000/products
   - Should see all 57 products
   - Images should load correctly
   - Infinite scroll should work

4. **Restore .env.local** (switch back to local)
   ```bash
   # Uncomment local for development
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   # NEXT_PUBLIC_SUPABASE_URL=https://nfydvfhrepavcyclzfrh.supabase.co
   ```

---

## 🎨 Step 5: Update Image URLs (If Needed)

If you're using Supabase Storage URLs instead of local paths:

### Option A: Keep Local Paths (Simpler)

Your images are at `/products/*.svg` which works if:
- Images are in `public/products/` folder
- You deploy with Vercel/similar (they serve public folder)

**No changes needed!** ✅

### Option B: Use Supabase Storage URLs

If you want to serve images from Supabase Storage:

1. **Update image paths in database**
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE products
   SET images = jsonb_set(
     jsonb_set(
       images,
       '{0,url}',
       to_jsonb('https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/' || slug || '-1.svg')
     ),
     '{1,url}',
     to_jsonb('https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/' || slug || '-2.svg')
   );
   ```

2. **Verify one product**
   ```bash
   curl -s "https://nfydvfhrepavcyclzfrh.supabase.co/rest/v1/products?select=slug,images&limit=1" \
     -H "apikey: YOUR_ANON_KEY" | jq
   ```

---

## 🚀 Step 6: Deploy to Production

If you're using Vercel or similar:

1. **Commit changes**
   ```bash
   git add .
   git commit -m "Add 48 new products with images and infinite scroll"
   git push origin main
   ```

2. **Vercel will auto-deploy**
   - Wait for deployment to complete
   - Visit your production URL
   - Test products page

3. **Verify production site**
   - All 57 products should appear
   - Images should load
   - Infinite scroll should work
   - Category filtering should work

---

## 🔄 Future Syncs

When you add more products locally:

### Quick Sync Process

1. **Add products locally**
   ```bash
   npx tsx scripts/seed-more-products.ts
   node scripts/create-missing-images.js
   ```

2. **Export data**
   ```bash
   node docs/database-migration/scripts/export-local-data.js
   ```

3. **Upload new images**
   - Upload only new .svg files to Supabase Storage

4. **Import data**
   - Run `production_import.sql` in Supabase SQL Editor

5. **Deploy**
   ```bash
   git add . && git commit -m "Add new products" && git push
   ```

---

## 🛠️ Troubleshooting

### Images not showing in production

**Problem:** Images show locally but not in production

**Solutions:**
1. Verify images uploaded to Supabase Storage
2. Check image URLs in database match storage paths
3. Verify storage bucket is public
4. Check browser console for 404 errors

### Data not syncing

**Problem:** SQL import succeeds but data doesn't appear

**Solutions:**
1. Check you're querying the right database
2. Verify API keys in .env
3. Clear browser cache
4. Check RLS policies allow reading

### Duplicate key errors

**Problem:** "duplicate key value violates unique constraint"

**Solution:** The SQL uses `ON CONFLICT DO UPDATE` - this shouldn't happen. If it does:
```sql
-- Delete conflicting data first
DELETE FROM products WHERE id IN (SELECT id FROM products LIMIT 10);
-- Then re-run import
```

### Storage upload fails

**Problem:** Can't upload images to Supabase Storage

**Solutions:**
1. Check storage bucket exists: `product-images`
2. Verify bucket is public
3. Check you have upload permissions
4. Try uploading one file manually first

---

## 📊 Summary Checklist

Before you start:
- [ ] Local database has 57 products
- [ ] All 114 SVG images exist in `public/products/`
- [ ] You have Supabase dashboard access
- [ ] You have production database credentials

After sync:
- [ ] `production_import.sql` created successfully
- [ ] 114 images uploaded to Supabase Storage
- [ ] SQL import completed without errors
- [ ] Products table shows 57 rows
- [ ] Test API returns 57 products
- [ ] Production site shows all products
- [ ] Images load correctly
- [ ] Infinite scroll works

---

## 🎉 Success!

Your local data is now synced to production! 

**What you've accomplished:**
- ✅ Exported 57 products from local database
- ✅ Uploaded 114 product images to cloud storage
- ✅ Imported all data to production database
- ✅ Verified everything works correctly

**Next steps:**
- Monitor production for any issues
- Add more products as needed
- Use the same process for future syncs

Need help? Check the troubleshooting section or review the detailed guides in `docs/database-migration/`.
