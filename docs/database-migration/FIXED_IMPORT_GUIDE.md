# ✅ Fixed Import Guide - Ready to Import!

## What Was Fixed

### **Error:**
```
column "tags" is of type text[] but expression is of type jsonb
```

### **Root Cause:**
The export script was incorrectly casting arrays as JSONB when they should be PostgreSQL text arrays.

### **Fix Applied:**
- ✅ Text arrays (tags, ingredients, allergens, features) → `ARRAY['item1','item2']`
- ✅ JSONB arrays (images, media) → `'[{...}]'::jsonb`
- ✅ JSONB objects (nutrition_facts) → `'{...}'::jsonb`

## ✅ Ready to Import

The `production_import.sql` file has been regenerated with correct data types.

## Import Steps

### 1. Open Supabase Dashboard

https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/sql/new

### 2. Copy ALL Content

Open `production_import.sql` and copy everything (Ctrl+A, Ctrl+C)

### 3. Paste and Run

- Paste into SQL Editor
- Click "Run" or press Ctrl+Enter
- Should complete in 1-2 seconds

### 4. Verify

```bash
./scripts/verify-production-data.sh
```

Expected:
```
✅ Categories: 5/5
✅ Products: 9/9
✅ Mixes: 2/2
```

## What Will Be Imported

- **5 Categories** with icons (🍜 🥚 📦 🧂 👕)
- **9 Products** with full details:
  - Images (JSONB arrays)
  - Tags (text arrays)
  - Ingredients (text arrays)
  - Nutrition facts (JSONB objects)
  - Pricing, descriptions, inventory
- **7 Sample Reviews**

## Data Type Reference

For future reference, here's how different fields are stored:

| Field | Type | Format | Example |
|-------|------|--------|---------|
| tags | text[] | `ARRAY['tag1','tag2']` | `ARRAY['bestseller','spicy']` |
| ingredients | text[] | `ARRAY['item1','item2']` | `ARRAY['Garlic','Salt']` |
| allergens | text[] | `ARRAY['item1']` | `ARRAY['Sesame']` |
| features | text[] | `ARRAY['item1']` | `ARRAY['Non-GMO']` |
| images | jsonb | `'[{...}]'::jsonb` | `'[{"url":"/img.jpg"}]'::jsonb` |
| nutrition_facts | jsonb | `'{...}'::jsonb` | `'{"calories":50}'::jsonb` |
| media | jsonb | `'[{...}]'::jsonb` | `'[]'::jsonb` |

## Troubleshooting

### Still getting type errors?
- Make sure you copied the LATEST `production_import.sql`
- The file was regenerated after the fix
- Check the file timestamp (should be recent)

### Import successful but no data showing?
- Clear browser cache
- Restart Next.js: `pnpm run dev`
- Check `.env.local` is using production URL

### Need to re-export?
```bash
node scripts/export-local-data.js
```

---

**The import file is now correct and ready to use!** 🚀
