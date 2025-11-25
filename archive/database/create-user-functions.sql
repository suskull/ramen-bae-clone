-- ============================================
-- Database Functions for User Management
-- Run this in Supabase SQL Editor
-- ============================================

-- Function to get all users with their emails
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_profiles() TO anon;

-- Test the function
SELECT * FROM get_users_with_profiles();
