/**
 * Complete Authentication System Example
 * 
 * This file demonstrates a production-ready authentication system with:
 * - Email/password authentication
 * - OAuth (Google, GitHub)
 * - Protected routes
 * - User profiles
 * - Role-based authorization
 * - Password reset
 * 
 * Based on Supabase Auth + Next.js App Router
 */

// ============================================================================
// 1. Supabase Client Setup
// ============================================================================

// lib/supabase/client.ts (Client-side)
import { createBrowserClient } from '@supabase/ssr';

export function createBrowserClientExample() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts (Server-side)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  );
}

// ============================================================================
// 2. Authentication Helpers
// ============================================================================

// lib/auth/helpers.ts
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function getUserOrNull() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAdmin() {
  const user = await getUser();
  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return { user, profile };
}

// ============================================================================
// 3. Middleware for Route Protection
// ============================================================================

// middleware.ts
import { createServerClient } from '@supabase/ssr';
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
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
  ],
};

// ============================================================================
// 4. Auth Context Provider
// ============================================================================

// contexts/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value= {{ user, loading, signOut }
}>
  { children }
  </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ============================================================================
// 5. Sign Up Component
// ============================================================================

// components/auth/signup-form.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
});

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate
      const validated = signupSchema.parse(formData);

      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            name: validated.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      alert('Check your email to confirm your account!');
      router.push('/login');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit= { handleSubmit } className = "space-y-4" >
      <div>
      <label className="block mb-1 font-medium" > Name </label>
        < input
  type = "text"
  value = { formData.name }
  onChange = {(e) => setFormData({ ...formData, name: e.target.value })
}
className = "w-full p-2 border rounded"
  />
  { errors.name && <p className="text-red-500 text-sm mt-1"> { errors.name } </p> }
  </div>

  < div >
  <label className="block mb-1 font-medium" > Email </label>
    < input
type = "email"
value = { formData.email }
onChange = {(e) => setFormData({ ...formData, email: e.target.value })}
className = "w-full p-2 border rounded"
  />
  { errors.email && <p className="text-red-500 text-sm mt-1"> { errors.email } </p> }
  </div>

  < div >
  <label className="block mb-1 font-medium" > Password </label>
    < input
type = "password"
value = { formData.password }
onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
className = "w-full p-2 border rounded"
  />
{
  errors.password && (
    <p className="text-red-500 text-sm mt-1"> { errors.password } </p>
        )
}
  </div>

{
  errors.general && (
    <div className="p-3 bg-red-50 text-red-700 rounded" > { errors.general } </div>
      )
}

<button
        type="submit"
disabled = { loading }
className = "w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
  >
  { loading? 'Creating account...': 'Sign Up' }
  </button>
  </form>
  );
}

// ============================================================================
// 6. Protected API Route
// ============================================================================

// app/api/profile/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export async function GET() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = profileSchema.parse(body);

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(validated)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

/*

// 1. Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePass123!',
  options: {
    data: { name: 'John Doe' }
  }
});

// 2. Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// 3. OAuth Sign In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// 4. Get Current User
const { data: { user } } = await supabase.auth.getUser();

// 5. Update Profile
const response = await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    bio: 'Software developer'
  })
});

// 6. Sign Out
await supabase.auth.signOut();

// 7. Password Reset
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: `${window.location.origin}/reset-password`
});

// 8. Check Admin Role
const { user, profile } = await requireAdmin();

*/
