# Exercise 06: Role-Based Authorization

Implement role-based access control (RBAC) for admin and user roles.

## Learning Objectives

- Understand authorization vs authentication
- Implement role-based access control
- Protect admin routes
- Create admin dashboard
- Manage user roles

## Part 1: Database Schema (10 minutes)

### Task 1.1: Add Role to Profiles

```sql
-- Add role column to profiles
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index
CREATE INDEX profiles_role_idx ON profiles(role);

-- Update RLS policy for admin access
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### Task 1.2: Create Helper Function

```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Part 2: Authorization Helpers (15 minutes)

### Task 2.1: Server-Side Auth Helper

**File**: `lib/auth/authorization.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  return { user, isAdmin, error: isAdmin ? null : 'Not authorized' };
}

export async function checkRole(requiredRole: 'user' | 'admin') {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (requiredRole === 'admin') {
    return profile?.role === 'admin';
  }

  return profile?.role === 'user' || profile?.role === 'admin';
}
```

### Task 2.2: Client-Side Hook

**File**: `hooks/use-role.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRole() {
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role || 'user');
      setLoading(false);
    }

    getRole();
  }, [supabase]);

  return { role, isAdmin: role === 'admin', loading };
}
```

## Part 3: Protected Admin Routes (20 minutes)

### Task 3.1: Admin Middleware

**File**: `app/admin/layout.tsx`

```typescript
import { requireAdmin } from '@/lib/auth/authorization';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

### Task 3.2: Admin Dashboard

**File**: `app/admin/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = createClient();

  // Get statistics
  const [
    { count: userCount },
    { count: productCount },
    { count: orderCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2">{userCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold mt-2">{productCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{orderCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/users"
          className="bg-white p-6 rounded-lg border hover:border-blue-500"
        >
          <h3 className="font-semibold text-lg mb-2">Manage Users</h3>
          <p className="text-gray-600">View and manage user accounts</p>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-lg border hover:border-blue-500"
        >
          <h3 className="font-semibold text-lg mb-2">Manage Products</h3>
          <p className="text-gray-600">Add, edit, and remove products</p>
        </Link>
      </div>
    </div>
  );
}
```

### Task 3.3: User Management Page

**File**: `app/admin/users/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.name || 'N/A'}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Part 4: Protected API Routes (10 minutes)

### Task 4.1: Admin-Only API

**File**: `app/api/admin/users/route.ts`

```typescript
import { requireAdmin } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { isAdmin, error } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = createClient();
  const { data: users } = await supabase.from('profiles').select('*');

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const { isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId, role } = await request.json();

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
```

## Part 5: Conditional UI (10 minutes)

### Task 5.1: Show Admin Links

**File**: `components/navigation.tsx`

```typescript
'use client';

import { useRole } from '@/hooks/use-role';
import Link from 'next/link';

export default function Navigation() {
  const { isAdmin, loading } = useRole();

  if (loading) return null;

  return (
    <nav className="flex gap-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/profile">Profile</Link>
      {isAdmin && (
        <Link href="/admin" className="text-purple-600 font-semibold">
          Admin
        </Link>
      )}
    </nav>
  );
}
```

## Challenges

### Challenge 1: Multiple Roles
Implement more roles (moderator, editor, etc.).

### Challenge 2: Permissions System
Create granular permissions (can_edit_products, can_delete_users, etc.).

### Challenge 3: Role Assignment UI
Build UI for admins to assign roles to users.

### Challenge 4: Audit Log
Track admin actions in an audit log.

### Challenge 5: Role-Based RLS
Implement complex RLS policies based on roles.

## Key Takeaways

- Authorization checks what users can do
- Always verify roles on the server
- Use RLS for database-level authorization
- Protect both routes and API endpoints
- Provide clear feedback for unauthorized access

## Module Complete!

You've mastered authentication! 🎉
