# Supabase Development - Quick Reference

## The Golden Rule

**🔑 Local → Test → Migrate → Production**

Never make changes directly in production!

## Quick Workflows

### 🆕 Adding a New Table

```bash
# 1. Create migration
supabase migration new add_notifications_table

# 2. Edit migration file (supabase/migrations/YYYYMMDDHHMMSS_add_notifications_table.sql)
# Add your CREATE TABLE SQL

# 3. Apply locally
supabase db reset

# 4. Test
pnpm dev

# 5. Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 6. Commit
git add supabase/migrations/ src/lib/supabase/
git commit -m "feat: add notifications table"
git push

# 7. Deploy
supabase db push
```

### ➕ Adding a Column

```bash
# 1. Create migration
supabase migration new add_bio_to_users

# 2. Edit migration
# ALTER TABLE users ADD COLUMN bio TEXT;

# 3. Apply → Test → Types → Commit → Deploy
supabase db reset
pnpm dev
supabase gen types typescript --local > src/lib/supabase/database.types.ts
git add . && git commit -m "feat: add bio to users" && git push
supabase db push
```

### 🔒 Adding RLS Policies

```bash
# 1. Create migration
supabase migration new add_rls_to_comments

# 2. Edit migration
# ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
# CREATE POLICY "policy_name" ON comments FOR SELECT USING (true);

# 3. Apply → Test → Commit → Deploy
supabase db reset
pnpm dev
git add . && git commit -m "security: add RLS to comments" && git push
supabase db push
```

### 🔄 Pulling Latest Changes (Team Member)

```bash
# 1. Pull code
git pull origin main

# 2. Apply migrations
supabase db reset

# 3. Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 4. Install deps (if needed)
pnpm install

# 5. Start dev
pnpm dev
```

### 📊 Syncing Data to Production

```bash
# 1. Export from local
node docs/database-migration/scripts/export-local-data.js

# 2. Import to production
# Copy docs/database-migration/exports/production_import.sql
# Paste in Supabase Dashboard → SQL Editor → Run
```

## Common Commands

| Task | Command |
|------|---------|
| Start local Supabase | `supabase start` |
| Stop local Supabase | `supabase stop` |
| Create migration | `supabase migration new name` |
| Apply migrations | `supabase migration up` |
| Reset DB (apply all) | `supabase db reset` |
| Generate types | `supabase gen types typescript --local > src/lib/supabase/database.types.ts` |
| Push to production | `supabase db push` |
| Pull from production | `supabase db pull` |
| Check status | `supabase status` |
| Open Studio | `open http://127.0.0.1:54323` |

## Migration Checklist

- [ ] Create migration file
- [ ] Write SQL (CREATE, ALTER, etc.)
- [ ] Apply locally (`supabase db reset`)
- [ ] Test application (`pnpm dev`)
- [ ] Generate TypeScript types
- [ ] Update application code
- [ ] Commit to git
- [ ] Push to production (`supabase db push`)
- [ ] Verify in production

## Common Patterns

### Create Table with RLS

```sql
-- Create table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Add Column with Default

```sql
ALTER TABLE users 
ADD COLUMN avatar_url TEXT DEFAULT '/default-avatar.png';
```

### Add Index

```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Add Foreign Key

```sql
ALTER TABLE comments
ADD CONSTRAINT fk_comments_post_id
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration fails | Fix SQL, run `supabase db reset` |
| Types out of sync | Run `supabase gen types typescript --local > src/lib/supabase/database.types.ts` |
| Local DB corrupted | Run `supabase db reset` |
| Can't connect to local | Run `supabase start` |
| Production out of sync | Run `supabase db pull` then review |

## Environment Switching

### Use Local Database

```bash
# In .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Use Production Database

```bash
# In .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key...
```

**Always restart dev server after changing!**

## Best Practices

✅ **Do:**
- Create migration for every schema change
- Test locally before production
- Use descriptive migration names
- Generate types after schema changes
- Commit migrations to git
- Small, focused migrations

❌ **Don't:**
- Make changes directly in production
- Skip local testing
- Forget to generate types
- Create huge migrations
- Manually edit old migrations

## Resources

- [Complete Workflow](./SUPABASE_WORKFLOW.md)
- [Database Migration](./database-migration/README.md)
- [Environment Management](./ENVIRONMENT_MANAGEMENT.md)

---

**Keep it simple: Local → Test → Migrate → Production** 🚀
