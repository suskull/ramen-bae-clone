# Complete Role-Based Access Setup Guide

## 🎯 Goal
Set up a working role-based access control system with test users that have emails properly displayed.

## ⚠️ Important Understanding

**Email is NOT stored in the `profiles` table!**
- `auth.users` table → stores email, password, auth data
- `public.profiles` table → stores role, name, bio, etc.
- They are linked by the same `id` (UUID)

## 📋 Step-by-Step Setup

### Step 1: Create the Database Function

Run this in **Supabase SQL Editor**:

```sql
-- This function joins auth.users and profiles to get emails
CREATE OR REPLACE FUNCTION get_users_with_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    u.email,
    p.name,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  INNER JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO anon;
```

### Step 2: Verify the Function Works

```sql
-- Test it
SELECT * FROM get_users_with_profiles();
```

You should see all users with their emails!

### Step 3: Clean Up Old Test Users (Optional)

If you have orphaned profiles or want to start fresh:

```sql
-- Delete test users
DELETE FROM auth.users WHERE email LIKE '%@test.com';
-- Profiles will auto-delete if foreign key CASCADE is set up
```

### Step 4: Set Up Service Role Key

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy the **service_role** key
3. Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 5: Run the Test Users Script

```bash
node scripts/setup-test-users-v2.js
```

This will create:
- `superadmin@test.com` (super_admin)
- `admin@test.com` (admin)
- `moderator@test.com` (moderator)
- `premium@test.com` (premium)
- `user@test.com` (user)

All with password: `password123`

### Step 6: Verify Everything Works

1. **Check in SQL:**
   ```sql
   SELECT * FROM get_users_with_profiles();
   ```

2. **Login to your app** as `superadmin@test.com`

3. **Visit `/admin/users`** - you should see all users with emails!

## ✅ What Should Work Now

- ✅ All users have emails displayed
- ✅ Role management works
- ✅ No "email: null" issues
- ✅ Admin page shows proper user list
- ✅ Role-based access control works

## 🔧 Troubleshooting

### "Function get_users_with_profiles does not exist"
- Run Step 1 again in SQL Editor
- Make sure there are no SQL errors

### "Users created but no emails showing"
- The users might not have been created in `auth.users`
- Check: `SELECT * FROM auth.users WHERE email LIKE '%@test.com';`
- If empty, the script didn't work - check service role key

### "Permission denied for function"
- Run the GRANT commands from Step 1
- Make sure you're logged in when testing

### Script fails with "Missing environment variables"
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Restart your terminal/IDE after adding it

## 🎮 Testing

Login with different accounts to test access:

| Email | Password | Can Access |
|-------|----------|------------|
| superadmin@test.com | password123 | Everything |
| admin@test.com | password123 | /admin, /moderator, /premium |
| moderator@test.com | password123 | /moderator, /premium |
| premium@test.com | password123 | /premium |
| user@test.com | password123 | /dashboard only |

## 📊 How It Works

```
┌─────────────┐         ┌──────────────┐
│ auth.users  │         │   profiles   │
├─────────────┤         ├──────────────┤
│ id (UUID)   │◄────────┤ id (UUID)    │
│ email       │         │ role         │
│ password    │         │ name         │
└─────────────┘         │ bio          │
                        └──────────────┘
                               │
                               ▼
                    get_users_with_profiles()
                    (joins both tables)
                               │
                               ▼
                        Your admin page
                        shows: email + role
```

The RPC function does the join in the database, so your app gets complete user data with emails!
