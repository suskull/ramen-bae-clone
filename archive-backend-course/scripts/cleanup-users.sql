-- ============================================
-- CLEANUP SCRIPT - Run this in Supabase SQL Editor
-- This will delete all test users and start fresh
-- ============================================

-- Delete all profiles (this will cascade if foreign key is set up)
DELETE FROM public.profiles 
WHERE email NOT LIKE '%@yourcompany.com%'  -- Keep your real users
OR id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'admin@test.com',
    'moderator@test.com', 
    'premium@test.com',
    'user@test.com',
    'test@example.com'
  )
);

-- Delete test users from auth.users (requires service role)
-- Note: This might not work in SQL Editor, use Dashboard instead
DELETE FROM auth.users 
WHERE email IN (
  'admin@test.com',
  'moderator@test.com',
  'premium@test.com', 
  'user@test.com',
  'test@example.com'
);

-- Verify cleanup
SELECT 'Remaining profiles:' as status, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Remaining auth users:' as status, COUNT(*) as count FROM auth.users;
