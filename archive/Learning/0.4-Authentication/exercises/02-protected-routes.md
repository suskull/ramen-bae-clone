# Exercise 02: Protected Routes with Middleware

Implement route protection using Next.js middleware.

## Learning Objectives

- Understand middleware in Next.js
- Protect routes based on auth state
- Redirect unauthenticated users
- Handle auth state in server components
- Create reusable auth utilities

## Part 1: Middleware Setup (15 minutes)

### Task 1.1: Create Middleware

Protect dashboard routes and redirect authenticated users away from auth pages.

**File**: `middleware.ts` (root of project)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  ) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
```

**Test it**:
1. Try visiting `/dashboard` without being logged in → redirects to `/login`
2. Log in, then try visiting `/login` → redirects to `/dashboard`
3. Access `/dashboard` while logged in → works!

### Task 1.2: Handle Redirect After Login

Update login page to redirect to original destination.

**File**: `app/login/page.tsx` (update)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get redirect parameter
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Redirect to original destination or dashboard
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>

      {searchParams.get('redirect') && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          Please sign in to continue
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        {/* ... rest of form ... */}
      </form>
    </div>
  );
}
```

## Part 2: Server Component Protection (15 minutes)

### 🤔 **Do We Need Server Component Auth Checks?**

**Good question!** If middleware is properly configured, it should handle redirects. However:

**Reasons to keep server component checks:**
- ✅ **Safety net** - Catches edge cases where middleware might miss
- ✅ **Development** - Easier debugging when auth fails
- ✅ **API calls** - Server components might call protected APIs
- ✅ **Dynamic routes** - Middleware matchers might not catch all patterns

**Reasons to skip server component checks:**
- ✅ **Performance** - One less auth check per request
- ✅ **Simplicity** - Trust middleware to do its job
- ✅ **DRY principle** - Don't repeat auth logic

**Recommendation:** Use the safety net approach for production, trust middleware for simple apps.

### Task 2.1: Protected Server Component

Create a reusable pattern for protected server components.

**File**: `lib/auth/get-user.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If middleware is properly configured, this should rarely trigger
  // But it's a safety net for edge cases
  if (!user) {
    console.warn('User not found in server component - middleware may have missed this route');
    redirect('/login');
  }

  return user;
}

export async function getUserOrNull() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// Alternative: Trust middleware completely
export async function getUserTrusted() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Assume middleware handled auth - just return user
  // This will be null if middleware failed, but we trust it won't happen
  return user!; // Non-null assertion
}
```

**Usage in Server Component**:

```typescript
// app/dashboard/page.tsx
import { getUser, getUserTrusted } from '@/lib/auth/get-user';

// Option 1: Safety net approach (recommended)
export default async function DashboardPage() {
  const user = await getUser(); // Has redirect as safety net

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
    </div>
  );
}

// Option 2: Trust middleware completely
export default async function DashboardPageTrusted() {
  const user = await getUserTrusted(); // Assumes middleware worked

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      {/* user is guaranteed to exist if middleware is correct */}
    </div>
  );
}
```

### Task 2.2: Profile Page

Create a protected profile page.

**File**: `app/profile/page.tsx`

```typescript
import { getUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile-form';

export default async function ProfilePage() {
  const user = await getUser();
  const supabase = createClient();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Account Information</h2>
        <p className="text-sm text-gray-600">Email: {user.email}</p>
        <p className="text-sm text-gray-600">
          Member since: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <ProfileForm profile={profile} userId={user.id} />
    </div>
  );
}
```

**File**: `components/profile-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function ProfileForm({
  profile,
  userId,
}: {
  profile: Profile | null;
  userId: string;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name,
        bio,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Tell us about yourself"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes('Error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
```

## Part 3: API Route Protection (15 minutes)

### Task 3.1: Protected API Route

Create a protected API endpoint.

**File**: `app/api/user/profile/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, bio } = body;

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      name,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile });
}
```

### Task 3.2: Auth Helper for API Routes

Create reusable auth helper.

**File**: `lib/auth/api-auth.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user, error: null };
}
```

**Usage**:

```typescript
// app/api/protected/route.ts
import { requireAuth } from '@/lib/auth/api-auth';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  // User is authenticated, proceed
  return NextResponse.json({ message: 'Protected data', user: user.email });
}
```

## Part 4: Client-Side Protection (10 minutes)

### Task 4.1: Protected Client Component

Create a wrapper for protected client components.

**File**: `components/protected-route.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }

      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

**Usage**:

```typescript
// app/dashboard/client-page.tsx
'use client';

import ProtectedRoute from '@/components/protected-route';

export default function ClientDashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Protected Client Component</h1>
        {/* Your protected content */}
      </div>
    </ProtectedRoute>
  );
}
```

## Challenges

### Challenge 1: Role-Based Access
Implement role-based route protection (admin, user, etc.).

### Challenge 2: Session Timeout
Add automatic logout after inactivity.

### Challenge 3: Multi-Step Auth
Create a multi-step authentication flow.

### Challenge 4: Auth Loading States
Improve loading states with skeleton screens.

### Challenge 5: Remember Last Page
Remember and redirect to the last visited page after login.

## Key Takeaways

- Middleware protects routes at the edge
- Server components should verify auth
- API routes must check authentication
- Client components need loading states
- Always redirect unauthenticated users
- Handle auth state consistently

## Next Exercise

Continue to Exercise 03 for social login (OAuth) implementation!
