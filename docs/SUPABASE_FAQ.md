# Supabase Development - FAQ

## Common Questions

### 1. What's the difference between `supabase migration up` and `supabase db reset`?

#### `supabase migration up`

**What it does:**
- Applies **only new/pending** migrations
- Incremental updates
- Keeps existing data

**Example:**
```bash
# You have migrations: 001.sql, 002.sql, 003.sql
# Database has: 001.sql, 002.sql applied
# Running migration up will apply: 003.sql only
```

**Use when:**
- ✅ Adding new migrations to existing database
- ✅ Want to keep existing data
- ✅ Production deployments
- ✅ Incremental development

**Example workflow:**
```bash
# Day 1: Create first migration
supabase migration new create_users_table
supabase migration up  # Applies 001_create_users_table.sql

# Day 2: Create second migration
supabase migration new add_email_to_users
supabase migration up  # Applies only 002_add_email_to_users.sql
```

#### `supabase db reset`

**What it does:**
- **Drops entire database**
- Recreates from scratch
- Applies **all migrations** in order
- Runs seed data (if exists)
- **Deletes all existing data**

**Example:**
```bash
# You have migrations: 001.sql, 002.sql, 003.sql
# Running db reset will:
# 1. Drop database
# 2. Create fresh database
# 3. Apply 001.sql
# 4. Apply 002.sql
# 5. Apply 003.sql
# 6. Run supabase/seed.sql (if exists)
```

**Use when:**
- ✅ Starting fresh
- ✅ Testing all migrations together
- ✅ Fixing migration conflicts
- ✅ Local development (safe to lose data)
- ✅ After pulling team changes

**⚠️ Warning:**
- Deletes ALL data in local database
- Never use in production!

#### Comparison Table

| Feature | `migration up` | `db reset` |
|---------|---------------|------------|
| Applies | Only new migrations | All migrations |
| Existing data | Keeps it | **Deletes it** |
| Database | Updates existing | Recreates from scratch |
| Speed | Fast (incremental) | Slower (full rebuild) |
| Use in production | ✅ Yes | ❌ Never |
| Use in local dev | ✅ Yes | ✅ Yes |
| Seed data | No | ✅ Yes |

#### When to Use Each

**Use `migration up`:**
```bash
# Scenario 1: Adding new migration
supabase migration new add_column
# Edit migration
supabase migration up  # ✅ Apply just this one

# Scenario 2: Production deployment
supabase db push  # Uses migration up internally
```

**Use `db reset`:**
```bash
# Scenario 1: Pulled team changes
git pull origin main
supabase db reset  # ✅ Apply all migrations fresh

# Scenario 2: Migration conflict
# Fix migration file
supabase db reset  # ✅ Start clean

# Scenario 3: Testing full migration sequence
supabase db reset  # ✅ Verify all migrations work together

# Scenario 4: Corrupted local database
supabase db reset  # ✅ Fresh start
```

#### Visual Example

**Initial State:**
```
Database: [001.sql ✅] [002.sql ✅]
Migrations folder: 001.sql, 002.sql, 003.sql
```

**After `migration up`:**
```
Database: [001.sql ✅] [002.sql ✅] [003.sql ✅]
Data: Preserved ✅
```

**After `db reset`:**
```
Database: [DROPPED] → [RECREATED] → [001.sql ✅] [002.sql ✅] [003.sql ✅]
Data: Lost ❌ (then seeded if seed.sql exists)
```

---

### 2. Should I delete old migration files before running `supabase db reset`?

#### Short Answer: **NO! Never delete old migration files.**

#### Why?

**Migration files are your database history:**
```
supabase/migrations/
├── 20251104092925_create_ramen_bae_schema.sql      # Keep ✅
├── 20251107035928_initial_schema.sql               # Keep ✅
├── 20251108120000_add_user_preferences.sql         # Keep ✅
└── 20251108150000_add_email_notifications.sql      # Keep ✅ (new)
```

Each file represents a point in time. Deleting them breaks your history.

#### What Happens When You Run `db reset`?

```bash
supabase db reset
```

**Process:**
1. Drops entire database
2. Creates fresh database
3. Applies migrations **in chronological order**:
   - 20251104092925_create_ramen_bae_schema.sql
   - 20251107035928_initial_schema.sql
   - 20251108120000_add_user_preferences.sql
   - 20251108150000_add_email_notifications.sql (new)
4. Runs seed data

**Result:** Database with all changes from all migrations.

#### What If You Delete Old Migrations?

**❌ Bad: Deleting old migrations**
```bash
# DON'T DO THIS!
rm supabase/migrations/20251104092925_create_ramen_bae_schema.sql
rm supabase/migrations/20251107035928_initial_schema.sql

# Now you only have:
supabase/migrations/
└── 20251108150000_add_email_notifications.sql

supabase db reset
# ERROR! Migration tries to add column to table that doesn't exist!
```

**Problems:**
- ❌ Migrations fail (references missing tables)
- ❌ Can't recreate database from scratch
- ❌ Team members can't sync
- ❌ Lost database history
- ❌ Can't rollback
- ❌ Production deployment breaks

#### Correct Workflow

**✅ Good: Keep all migrations**
```bash
# 1. Create new migration
supabase migration new add_email_notifications

# 2. Edit the new migration file
# supabase/migrations/20251108150000_add_email_notifications.sql

# 3. Apply all migrations (including old ones)
supabase db reset

# All migrations folder:
supabase/migrations/
├── 20251104092925_create_ramen_bae_schema.sql      # Old ✅
├── 20251107035928_initial_schema.sql               # Old ✅
├── 20251108120000_add_user_preferences.sql         # Old ✅
└── 20251108150000_add_email_notifications.sql      # New ✅
```

**Result:** Database correctly built from all migrations.

#### When Can You Delete Migrations?

**Only in these rare cases:**

**1. Squashing Migrations (Advanced)**

If you have 100+ migrations and want to consolidate:

```bash
# Create a fresh migration with current schema
supabase db dump --local -f supabase/migrations/20251108_squashed_schema.sql

# Move old migrations to archive
mkdir supabase/migrations_archive
mv supabase/migrations/202511* supabase/migrations_archive/

# Keep only the squashed migration
# Test thoroughly!
supabase db reset
```

**⚠️ Warning:** Only do this if:
- You understand the risks
- You've backed up everything
- Team is coordinated
- Production is already up to date

**2. Removing a Bad Migration (Before Pushing)**

```bash
# You just created a migration with errors
supabase migration new add_bad_column
# Oops, it has errors!

# Safe to delete ONLY if:
# - Not committed to git yet
# - Not pushed to production
# - Not shared with team

rm supabase/migrations/20251108_add_bad_column.sql
# Create a corrected version
supabase migration new add_correct_column
```

#### Best Practices

**✅ Do:**
- Keep all migration files
- Commit migrations to git
- Apply migrations in order
- Use `db reset` to test full sequence
- Archive old migrations if needed (don't delete)

**❌ Don't:**
- Delete old migrations
- Edit old migrations (create new ones instead)
- Reorder migrations
- Skip migrations

#### Real-World Example

**Team Scenario:**

**Developer A:**
```bash
# Monday: Create users table
supabase migration new create_users_table
git commit && git push
```

**Developer B:**
```bash
# Tuesday: Pull changes
git pull origin main

# If Developer A deleted old migrations:
supabase db reset
# ❌ ERROR! Can't build database

# With all migrations kept:
supabase db reset
# ✅ SUCCESS! Database built correctly
```

#### Migration History is Like Git History

Think of migrations like git commits:

```bash
# Git commits
git log
  commit abc123 (latest)
  commit def456
  commit ghi789 (oldest)

# You wouldn't delete old commits!
# Same with migrations:

supabase/migrations/
  20251108_latest.sql    (latest)
  20251107_middle.sql
  20251104_oldest.sql    (oldest)

# Keep them all!
```

---

## Quick Reference

### Commands Comparison

```bash
# Apply only new migrations (incremental)
supabase migration up

# Rebuild database from scratch (all migrations)
supabase db reset

# Create new migration
supabase migration new name

# List migrations
supabase migration list

# Deploy to production (uses migration up)
supabase db push
```

### Decision Tree

```
Need to apply migrations?
│
├─ Local development?
│  ├─ Just created new migration?
│  │  └─ Use: supabase migration up
│  │
│  ├─ Pulled team changes?
│  │  └─ Use: supabase db reset
│  │
│  └─ Database corrupted?
│     └─ Use: supabase db reset
│
└─ Production deployment?
   └─ Use: supabase db push (uses migration up)
```

### Migration File Management

```
✅ KEEP:
- All migration files
- In chronological order
- Committed to git

❌ DON'T:
- Delete old migrations
- Edit old migrations
- Reorder migrations
- Skip migrations

✅ IF NEEDED:
- Archive old migrations (move to archive folder)
- Squash migrations (advanced, with caution)
- Create new migration to fix old one
```

---

## Summary

### Question 1: `migration up` vs `db reset`

- **`migration up`**: Incremental, keeps data, applies only new migrations
- **`db reset`**: Full rebuild, deletes data, applies all migrations

**Use `migration up` for:** Production, incremental updates
**Use `db reset` for:** Local development, testing, fresh start

### Question 2: Delete old migrations?

**NO!** Keep all migration files.

- They are your database history
- Needed to rebuild database
- Required for team collaboration
- Essential for production deployment

**Only delete if:**
- Migration not yet committed/pushed
- You're doing advanced squashing (rare)
- You know exactly what you're doing

---

## Related Documentation

- [Supabase Workflow](./SUPABASE_WORKFLOW.md)
- [Supabase Quick Reference](./SUPABASE_QUICK_REFERENCE.md)
- [Database Migration Guide](./database-migration/README.md)

---

**Remember: Keep all migrations, use `db reset` for local development!** 🚀
