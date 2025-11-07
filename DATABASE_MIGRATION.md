# Database Migration & Sync

All database migration, sync, and seeding documentation has been moved to:

📁 **`docs/database-migration/`**

## Quick Links

- **Import Data to Production:** `docs/database-migration/FIXED_IMPORT_GUIDE.md`
- **Sync Workflow:** `docs/database-migration/DATA_SYNC_GUIDE.md`
- **Migration Guide:** `docs/database-migration/MIGRATION_GUIDE.md`
- **Main Import File:** `docs/database-migration/exports/production_import.sql`

## Quick Commands

```bash
# Export data from local
node docs/database-migration/scripts/export-local-data.js

# Verify production data
./docs/database-migration/scripts/verify-production-data.sh

# Create new migration
supabase migration new descriptive_name
```

See `docs/database-migration/README.md` for complete documentation.
