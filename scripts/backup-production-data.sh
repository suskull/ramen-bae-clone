#!/bin/bash

# Backup production data before sync
# Run this before importing to have a rollback option

echo "🔒 Backing up production data..."
echo ""

# Check if password is provided
if [ -z "$1" ]; then
  echo "Usage: ./scripts/backup-production-data.sh [DATABASE_PASSWORD]"
  echo ""
  echo "Get your password from:"
  echo "Supabase Dashboard → Settings → Database → Database Password"
  exit 1
fi

PASSWORD=$1
DB_URL="postgresql://postgres:${PASSWORD}@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres"
BACKUP_FILE="production_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Exporting production database..."
echo "Output file: $BACKUP_FILE"
echo ""

# Export only the tables we're going to sync
pg_dump "$DB_URL" \
  --table=categories \
  --table=products \
  --table=reviews \
  --table=carts \
  --table=cart_items \
  --data-only \
  --inserts \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Backup complete!"
  echo "📄 File: $BACKUP_FILE"
  echo ""
  echo "To restore this backup later:"
  echo "psql \"$DB_URL\" < $BACKUP_FILE"
else
  echo ""
  echo "❌ Backup failed!"
  exit 1
fi
