# 🚀 Ready to Import Data to Production

## Current Status

✅ **Schema:** Synced (local and production match)  
⚠️ **Data:** Production is empty (0 categories, 0 products)  
✅ **Export File:** `production_import.sql` is ready  

## Quick Import Steps

### 1. Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/sql/new

### 2. Copy the SQL

Open `production_import.sql` in your editor and copy ALL content (85 lines)

### 3. Paste and Run

- Paste into the SQL Editor
- Click "Run" (or press Ctrl+Enter)
- Wait 1-2 seconds for completion

### 4. Verify

Run this command:
```bash
./scripts/verify-production-data.sh
```

Expected output:
```
✅ Categories: 5/5
✅ Products: 9/9
✅ Mixes: 2/2
```

## What Will Be Imported

### Categories (5)
- 🍜 Mixes
- 🥚 Single Toppings
- 📦 Bundles
- 🧂 Seasoning and Sauce
- 👕 Merch

### Products (9)
1. Ultimate Ramen Mix ($24.99)
2. Spicy Lover's Mix ($19.99)
3. Crispy Garlic ($12.99)
4. Toasted Sesame Seeds ($9.99)
5. Nori Seaweed Strips ($11.99)
6. Ramen Starter Bundle ($44.99)
7. Umami Boost Powder ($14.99)
8. Spicy Chili Oil ($16.99)
9. Ramen Bae T-Shirt ($29.99)

### Reviews (7)
Sample reviews for products

## Troubleshooting

### "Error: duplicate key"
- This means data already exists
- The SQL handles this with `ON CONFLICT`
- Should not happen on first import

### "Error: relation does not exist"
- Schema not synced
- Run: `supabase db push`

### Still seeing 0 products after import
- Clear browser cache
- Restart Next.js dev server
- Check `.env.local` is using production URL

## After Import

### Test Your App
1. Visit: http://localhost:3000/products
2. You should see all 9 products
3. Click category filters (Mixes, Single Toppings, etc.)
4. Each category should show correct products

### Upload Product Images (Optional)
The SQL references image paths like `/products/ultimate-mix-1.svg`
These are placeholder images. To use real images:
1. Upload to Supabase Storage
2. Update product image URLs

## Need Help?

If import fails, check:
1. ✅ Schema is synced: `supabase db push`
2. ✅ Using correct project
3. ✅ SQL Editor has no syntax errors
4. ✅ All 85 lines were copied

---

**Ready? Go to the Supabase Dashboard and paste the SQL!** 🚀
