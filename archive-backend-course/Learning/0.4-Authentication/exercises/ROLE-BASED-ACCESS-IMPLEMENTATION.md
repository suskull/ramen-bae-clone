# Role-Based Access Control Implementation

## Overview

This implementation extends the protected routes system with comprehensive role-based access control (RBAC). Users can have different roles with hierarchical permissions, and the system protects routes, components, and API endpoints based on these roles.

## Role Hierarchy

The system implements a 5-level role hierarchy:

1. **User** (Level 1) - Basic authenticated user
2. **Premium** (Level 2) - Paid subscriber with enhanced features
3. **Moderator** (Level 3) - Content moderation and community management
4. **Admin** (Level 4) - System administration and user management
5. **Super Admin** (Level 5) - Highest level system access

Higher-level roles inherit permissions from lower levels.

## Key Components

### 1. Middleware Configuration (`src/lib/auth/middleware-config.ts`)

- Defines route configurations with role requirements
- Implements role hierarchy and permission checking
- Provides utility functions for role validation

### 2. Enhanced Middleware (`src/middleware.ts`)

- Fetches user role from database
- Checks route permissions before allowing access
- Redirects unauthorized users to appropriate pages
- Adds user info to request headers

### 3. Role Guard Component (`src/components/role-guard.tsx`)

- Client-side component for conditional rendering
- Hook for role checking in components
- Higher-order component wrapper

### 4. User Role Manager (`src/components/user-role-manager.tsx`)

- Admin interface for managing user roles
- Prevents privilege escalation
- Real-time role updates

## Protected Routes

### Public Routes
- `/` - Home page
- `/about`, `/contact`, `/products` - Marketing pages
- `/unauthorized` - Access denied page

### Authentication Routes
- `/login`, `/signup` - Redirect authenticated users
- `/forgot-password` - Password reset

### User Routes (Any authenticated user)
- `/dashboard` - Main user dashboard
- `/profile`, `/settings`, `/account` - User management
- `/orders`, `/cart`, `/wishlist` - E-commerce features

### Premium Routes (Premium+)
- `/premium` - Premium features dashboard
- `/premium/analytics` - Advanced analytics

### Moderator Routes (Moderator+)
- `/moderator` - Moderation panel
- `/moderator/reports` - User reports
- `/moderator/content` - Content moderation

### Admin Routes (Admin+)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/settings` - System settings
- `/admin/analytics` - System analytics

### Super Admin Routes (Super Admin only)
- `/super-admin` - Super admin panel
- `/super-admin/system` - System administration

## API Protection

### Protected API Routes
- `/api/protected` - Any authenticated user
- `/api/premium` - Premium users and above
- `/api/moderator` - Moderators and above
- `/api/admin` - Admins and above
- `/api/super-admin` - Super admins only

### Role Management API
- `PATCH /api/admin/users/[userId]/role` - Update user role
- `GET /api/admin/users/[userId]/role` - Get user role info

## Usage Examples

### Server Components

```typescript
import { getUser } from '@/lib/auth/get-user';

export default async function AdminPage() {
  const user = await getUser(); // Middleware handles auth
  // Component content
}
```

### Client Components with Role Guards

```typescript
import RoleGuard from '@/components/role-guard';

export default function MyComponent() {
  return (
    <RoleGuard 
      allowedRoles={['admin', 'super_admin']}
      fallback={<div>Access denied</div>}
    >
      <AdminContent />
    </RoleGuard>
  );
}
```

### Using Role Hooks

```typescript
import { useUserRole } from '@/components/role-guard';

export default function MyComponent() {
  const { userRole, hasRole, hasAnyRole } = useUserRole();
  
  if (hasRole('admin')) {
    return <AdminFeatures />;
  }
  
  return <RegularContent />;
}
```

### API Route Protection

```typescript
import { requireAuth } from '@/lib/auth/api-auth';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;
  
  // Check role if needed
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!['admin', 'super_admin'].includes(profile?.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  // Proceed with admin logic
}
```

## Security Features

### Privilege Escalation Prevention
- Users cannot modify their own roles
- Users cannot assign roles higher than their own
- Users cannot modify users with equal or higher roles

### Audit Trail
- Role changes are logged with user information
- Timestamps track when roles are modified

### Fail-Safe Defaults
- Unknown roles default to 'user' level
- Missing role configurations deny access
- Server-side validation on all role changes

## Database Schema

The system expects a `profiles` table with:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'moderator', 'admin', 'super_admin')),
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing the Implementation

1. **Visit `/role-demo`** - Interactive demonstration of role-based content
2. **Try accessing different routes** - Test middleware protection
3. **Use admin panel** - Manage user roles (admin+ required)
4. **Check unauthorized page** - See access denied handling

## Best Practices

1. **Always validate on server-side** - Client-side checks are for UX only
2. **Use middleware for route protection** - Centralized access control
3. **Implement role hierarchy** - Avoid duplicating permissions
4. **Log security events** - Track role changes and access attempts
5. **Fail securely** - Deny access when in doubt
6. **Test thoroughly** - Verify all role combinations work correctly

## Extending the System

To add new roles or modify permissions:

1. Update `UserRole` type in `middleware-config.ts`
2. Add role to `roleHierarchy` object
3. Update route configurations as needed
4. Add new protected routes to middleware matcher
5. Update database constraints if needed
6. Test all affected functionality

This implementation provides a robust, scalable foundation for role-based access control in Next.js applications with Supabase authentication.