# Test Users Setup Instructions

## 🎯 Goal
Create multiple test users with different roles in both `auth.users` and `public.profiles` tables.

## 📋 Prerequisites

1. **Node.js installed**
2. **Supabase project set up**
3. **Service role key** (required for creating auth users)

## 🔑 Get Your Service Role Key

1. Go to **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Add it to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **IMPORTANT**: Never commit the service role key to git!

## 🧹 Step 1: Clean Up (Optional)

If you want to start completely fresh:

### Option A: SQL Editor
```sql
-- Run in Supabase SQL Editor
DELETE FROM public.profiles WHERE email LIKE '%@test.com';
```

### Option B: Dashboard
1. Go to **Authentication** → **Users**
2. Delete test users manually

## 🚀 Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

## ▶️ Step 3: Run the Setup Script

```bash
node scripts/setup-test-users-v2.js
```

## ✅ Expected Output

```
🚀 Starting test user setup...

✅ Connected to Supabase

📧 Processing superadmin@test.com...
   🔨 Creating user in auth.users...
   ✅ Created auth user (ID: abc-123...)
   🔨 Setting up profile...
   ✅ Profile set with role: super_admin
   ✅ Verified: Super Admin User (super_admin)

... (continues for all users)

============================================================
📊 SETUP SUMMARY
============================================================

✅ Created 5 new users:
   - superadmin@test.com
   - admin@test.com
   - moderator@test.com
   - premium@test.com
   - user@test.com

============================================================
🎉 SETUP COMPLETE!
============================================================

📋 Test Accounts (all passwords: password123):
   superadmin@test.com       → super_admin
   admin@test.com            → admin
   moderator@test.com        → moderator
   premium@test.com          → premium
   user@test.com             → user
```

## 🧪 Step 4: Verify Setup

### Check in Database:
```sql
SELECT 
  u.email,
  p.role,
  p.name
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@test.com'
ORDER BY p.role DESC;
```

### Check in App:
1. Login as `superadmin@test.com` / `password123`
2. Visit `/admin/users`
3. You should see all 5 test users with their roles

## 🎮 Testing Different Roles

| Email | Password | Role | Can Access |
|-------|----------|------|------------|
| superadmin@test.com | password123 | super_admin | Everything including /super-admin |
| admin@test.com | password123 | admin | /admin, /moderator, /premium, /dashboard |
| moderator@test.com | password123 | moderator | /moderator, /premium, /dashboard |
| premium@test.com | password123 | premium | /premium, /dashboard |
| user@test.com | password123 | user | /dashboard only |

## 🔧 Troubleshooting

### Error: "Missing environment variables"
- Make sure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Restart your terminal after adding it

### Error: "Failed to create auth user"
- Check that service role key is correct
- Verify Supabase project is active

### Error: "Failed to create profile"
- Check that `profiles` table exists
- Verify foreign key constraint exists
- Check RLS policies aren't blocking inserts

### Users created but can't login
- Make sure `email_confirm: true` is set in the script
- Check Supabase email settings

## 🔄 Re-running the Script

The script is **idempotent** - you can run it multiple times:
- Existing users will be **updated** (profile role refreshed)
- New users will be **created**
- No duplicates will be created

## 🗑️ Cleanup

To remove all test users:

```bash
# In Supabase SQL Editor
DELETE FROM auth.users WHERE email LIKE '%@test.com';
-- Profiles will be auto-deleted due to CASCADE
```

Or use the Dashboard to delete users manually.
