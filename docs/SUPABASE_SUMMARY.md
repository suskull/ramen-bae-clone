# Supabase Development - Summary

## The Complete Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  SUPABASE DEVELOPMENT FLOW                    │
└──────────────────────────────────────────────────────────────┘

1. LOCAL DEVELOPMENT
   ├── supabase start                    # Start local instance
   ├── supabase migration new name       # Create migration
   ├── Edit migration file               # Write SQL
   └── supabase db reset                 # Apply migrations
        ↓
2. TESTING
   ├── pnpm dev                          # Test application
   ├── Manual testing                    # Verify changes
   └── Automated tests (optional)        # Run test suite
        ↓
3. TYPE GENERATION
   └── supabase gen types typescript --local > src/lib/supabase/database.types.ts
        ↓
4. VERSION CONTROL
   ├── git add supabase/migrations/      # Stage migration
   ├── git add src/lib/supabase/         # Stage types
   ├── git commit -m "feat: ..."         # Commit
   └── git push origin main              # Push
        ↓
5. PRODUCTION DEPLOYMENT
   ├── supabase link (if not linked)     # Link to project
   └── supabase db push                  # Deploy migrations
        ↓
6. VERIFICATION
   └── Test production                   # Verify changes
```

## Key Principles

### 1. **Migration-First Development**

Every schema change must go through a migration file.

**Why?**
- ✅ Version controlled
- ✅ Reproducible
- ✅ Rollback capable
- ✅ Team collaboration
- ✅ Audit trail

### 2. **Local-First Testing**

Always test locally before production.

**Why?**
- ✅ Safe experimentation
- ✅ Fast iteration
- ✅ No production impact
- ✅ Catch errors early

### 3. **Type Safety**

Generate TypeScript types after every schema change.

**Why?**
- ✅ Compile-time safety
- ✅ Better IDE support
- ✅ Fewer runtime errors
- ✅ Self-documenting code

## Common Scenarios

### Scenario 1: Adding a New Feature

**Example: User Profiles**

```bash
# 1. Create migration
supabase migration new create_user_profiles_table

# 2. Write SQL
```

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
```

```bash
# 3. Apply locally
supabase db reset

# 4. Test
pnpm dev

# 5. Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 6. Build feature
# Create components, API routes, etc.

# 7. Commit and deploy
git add .
git commit -m "feat: add user profiles"
git push
supabase db push
```

### Scenario 2: Modifying Existing Schema

**Example: Add Email Notifications Preference**

```bash
# 1. Create migration
supabase migration new add_email_notifications_to_user_profiles

# 2. Write SQL
```

```sql
ALTER TABLE user_profiles 
ADD COLUMN email_notifications BOOLEAN DEFAULT true;
```

```bash
# 3. Apply → Test → Types → Deploy
supabase db reset
pnpm dev
supabase gen types typescript --local > src/lib/supabase/database.types.ts
git add . && git commit -m "feat: add email notifications preference" && git push
supabase db push
```

### Scenario 3: Team Collaboration

**Team Member A creates migration:**

```bash
# A: Create and push migration
supabase migration new add_comments_table
# Edit migration
supabase db reset
git add . && git commit -m "feat: add comments" && git push
```

**Team Member B pulls changes:**

```bash
# B: Pull and apply
git pull origin main
supabase db reset  # Applies new migration
supabase gen types typescript --local > src/lib/supabase/database.types.ts
pnpm dev
```

### Scenario 4: Production Hotfix

**Issue: Missing index causing slow queries**

```bash
# 1. Create migration
supabase migration new add_index_to_products_category

# 2. Write SQL
```

```sql
CREATE INDEX CONCURRENTLY idx_products_category_id 
ON products(category_id);
```

```bash
# 3. Test locally
supabase db reset
# Verify index exists
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "\d products"

# 4. Deploy immediately
git add . && git commit -m "perf: add index to products.category_id" && git push
supabase db push

# 5. Verify in production
# Check query performance
```

## Best Practices Checklist

### Before Making Changes

- [ ] Local Supabase is running (`supabase status`)
- [ ] Latest code pulled (`git pull`)
- [ ] Migrations applied (`supabase db reset`)

### Making Changes

- [ ] Create migration file (`supabase migration new name`)
- [ ] Write clear, focused SQL
- [ ] Include comments for complex logic
- [ ] Add RLS policies if creating tables
- [ ] Add indexes for foreign keys

### Testing Changes

- [ ] Apply migration locally (`supabase db reset`)
- [ ] Test application (`pnpm dev`)
- [ ] Verify data integrity
- [ ] Test RLS policies
- [ ] Check performance

### After Changes

- [ ] Generate types (`supabase gen types...`)
- [ ] Update application code
- [ ] Write tests (optional)
- [ ] Commit with descriptive message
- [ ] Push to git
- [ ] Deploy to production (`supabase db push`)
- [ ] Verify in production

## Common Mistakes to Avoid

### ❌ Don't: Make Changes Directly in Production

```bash
# DON'T do this in production Studio!
ALTER TABLE users ADD COLUMN phone TEXT;
```

**Why?** No version control, no rollback, team out of sync.

### ❌ Don't: Skip Local Testing

```bash
# DON'T do this
supabase migration new add_column
# Edit migration
git commit && git push
supabase db push  # Deploy without testing!
```

**Why?** Might break production.

### ❌ Don't: Forget to Generate Types

```bash
# DON'T forget this step
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

**Why?** TypeScript won't know about new schema.

### ❌ Don't: Create Huge Migrations

```sql
-- DON'T create one migration with everything
CREATE TABLE users...
CREATE TABLE products...
CREATE TABLE orders...
-- 500 lines of SQL
```

**Why?** Hard to review, debug, and rollback.

### ✅ Do: Small, Focused Migrations

```bash
supabase migration new create_users_table
supabase migration new create_products_table
supabase migration new create_orders_table
```

**Why?** Easy to review, debug, and rollback.

## Tools and Commands

### Essential Commands

```bash
# Development
supabase start                    # Start local instance
supabase stop                     # Stop local instance
supabase status                   # Check status
supabase db reset                 # Reset and apply all migrations

# Migrations
supabase migration new name       # Create migration
supabase migration up             # Apply pending migrations
supabase migration list           # List migrations

# Types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Production
supabase link                     # Link to project
supabase db push                  # Push migrations
supabase db pull                  # Pull schema from production

# Utilities
supabase logs                     # View logs
supabase db remote                # Connect to production DB
```

### Helper Scripts

```bash
# Export data from local
node docs/database-migration/scripts/export-local-data.js

# Verify production data
./docs/database-migration/scripts/verify-production-data.sh

# Generate placeholder images
node docs/database-migration/scripts/create-missing-images.js
```

## Documentation Index

### Quick Start
- [Quick Reference](./SUPABASE_QUICK_REFERENCE.md) - Common commands and patterns

### Complete Guides
- [Complete Workflow](./SUPABASE_WORKFLOW.md) - Detailed step-by-step guide
- [Environment Management](./ENVIRONMENT_MANAGEMENT.md) - Managing environments
- [Database Migration](./database-migration/README.md) - Migration tools

### Specific Topics
- [Environment Quick Start](./ENVIRONMENT_QUICK_START.md) - Setup guide
- [Environment Summary](./ENVIRONMENT_SUMMARY.md) - Quick reference

## Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Remember: Local → Test → Migrate → Production** 🚀
