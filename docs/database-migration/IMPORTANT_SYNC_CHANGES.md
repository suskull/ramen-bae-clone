# ⚠️ Important Changes to Sync Process

## What Changed

The `production_import.sql` file now **DELETES existing data** before inserting new data.

### Previous Behavior (OLD)
- Used `ON CONFLICT DO UPDATE`
- Kept old products and updated them
- Could result in duplicate or orphaned data

### New Behavior (CURRENT)
- **Deletes all existing data first**
- Then inserts fresh data from local
- Ensures clean sync without duplicates

## What Gets Deleted

When you run `production_import.sql`, it will DELETE:

✅ **Safe to delete (will be replaced):**
- All categories
- All products
- All reviews
- All carts
- All cart items

❌ **NOT deleted (stays safe):**
- User accounts
- Orders
- Payments
- Any other tables

## Why This Change?

**Problem:** The old approach could leave orphaned data if you:
- Deleted products locally
- Renamed products
- Changed product IDs

**Solution:** Clean slate approach ensures production exactly matches local.

## How to Use Safely

### Option 1: Backup First (Recommended)

```bash
# 1. Backup production data
./scripts/backup-production-data.sh YOUR_DB_PASSWORD

# 2. Run the sync (via Supabase Dashboard)
# Copy/paste production_import.sql into SQL Editor

# 3. If something goes wrong, restore:
psql "postgresql://postgres:PASSWORD@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres" \
  < production_backup_YYYYMMDD_HHMMSS.sql
```

### Option 2: Test in Staging First

If you have a staging environment:
1. Run sync in staging first
2. Verify everything works
3. Then run in production

### Option 3: Just Do It (YOLO)

If you're confident and don't have critical production data:
1. Copy `production_import.sql`
2. Paste in Supabase SQL Editor
3. Click Run
4. Done!

## What to Expect

When you run the SQL, you'll see:

```sql
-- Step 1: Deletes
DELETE 0    -- cart_items (probably 0)
DELETE 0    -- carts (probably 0)
DELETE X    -- reviews (however many you had)
DELETE X    -- products (however many you had)
DELETE 5    -- categories

-- Step 2: Inserts
INSERT 0 5  -- categories
INSERT 0 57 -- products
INSERT 0 7  -- reviews
```

## Rollback Plan

If you need to undo the sync:

### If you made a backup:
```bash
psql "postgresql://postgres:PASSWORD@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres" \
  < production_backup_YYYYMMDD_HHMMSS.sql
```

### If you didn't make a backup:
- You'll need to re-export from wherever your previous data was
- Or manually re-enter data via Supabase Dashboard
- Or restore from Supabase's automatic backups (if available)

## Files Updated

- ✅ `docs/database-migration/scripts/export-local-data.js` - Adds DELETE statements
- ✅ `production_import.sql` - Regenerated with DELETE statements
- ✅ `docs/SYNC_TO_PRODUCTION.md` - Updated with warnings
- ✅ `scripts/backup-production-data.sh` - New backup script
- ✅ `IMPORTANT_SYNC_CHANGES.md` - This file

## Migration Path

If you already have production data and want to keep it:

### Option A: Merge Instead of Replace

Manually edit `production_import.sql`:
1. Remove the DELETE statements
2. Add back `ON CONFLICT DO UPDATE` clauses
3. Run the modified SQL

### Option B: Selective Sync

Only sync specific tables:
1. Comment out DELETE statements for tables you want to keep
2. Comment out INSERT statements for tables you want to keep
3. Run the modified SQL

### Option C: Fresh Start (Recommended)

Just run it as-is. You have 57 products locally that will replace whatever is in production.

## Questions?

**Q: Will this delete my user accounts?**
A: No, only categories, products, reviews, carts, and cart_items.

**Q: Will this delete my orders?**
A: No, orders table is not touched.

**Q: Can I undo this?**
A: Yes, if you made a backup first. Otherwise, you'll need to restore from another source.

**Q: Is this safe?**
A: Yes, as long as you understand it deletes the specified tables. Make a backup if you're unsure.

**Q: Why not use ON CONFLICT?**
A: Because it doesn't handle deletions. If you delete a product locally, it would stay in production with ON CONFLICT.

## Ready to Sync?

Follow the guide: [`docs/SYNC_TO_PRODUCTION.md`](docs/SYNC_TO_PRODUCTION.md)

The guide now includes all the warnings and backup instructions.
