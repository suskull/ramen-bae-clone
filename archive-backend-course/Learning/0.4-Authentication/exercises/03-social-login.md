# Exercise 03: Social Login (OAuth)

Implement social authentication with Google and GitHub.

## Learning Objectives

- Understand OAuth 2.0 flow
- Implement Google OAuth
- Implement GitHub OAuth
- Handle OAuth callbacks
- Manage OAuth user data

## Part 1: OAuth Fundamentals (10 minutes)

### What is OAuth?

OAuth allows users to sign in using their existing accounts (Google, GitHub, etc.) without creating new passwords.

**OAuth Flow**:
```
1. User clicks "Sign in with Google"
2. Redirect to Google's login page
3. User approves access
4. Google redirects back with code
5. Exchange code for user data
6. Create/update user in your database
```

**Frontend Analogy**: Like using "Continue with Apple" on apps - you trust Apple to verify who you are.

## Part 2: Google OAuth Setup (15 minutes)

### Task 2.1: Configure Google OAuth

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing)
3. **Enable Google+ API**
4. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
   - For production: `https://yourapp.com/auth/callback`

5. **Copy credentials** to `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Task 2.2: Configure in Supabase

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Google provider**
3. **Add Google Client ID and Secret**
4. **Add redirect URL**: Copy from Supabase (looks like `https://xxx.supabase.co/auth/v1/callback`)
5. **Add this URL to Google Cloud Console** authorized redirect URIs

### Task 2.3: Implement Google Sign In

**File**: `components/auth/google-signin.tsx`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      alert('Failed to sign in with Google');
      setLoading(false);
    }
    // User will be redirected to Google
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
}
```

### Task 2.4: Add to Login Page

**File**: `app/login/page.tsx` (update)

```typescript
import GoogleSignIn from '@/components/auth/google-signin';
import GitHubSignIn from '@/components/auth/github-signin';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>

      {/* Social Login */}
      <div className="space-y-3 mb-6">
        <GoogleSignIn />
        <GitHubSignIn />
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        {/* ... existing email/password form ... */}
      </form>
    </div>
  );
}
```

## Part 3: GitHub OAuth Setup (15 minutes)

### Task 3.1: Configure GitHub OAuth

1. **Go to GitHub**: Settings → Developer settings → OAuth Apps
2. **New OAuth App**:
   - Application name: Your App Name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: Get from Supabase dashboard
3. **Copy Client ID and Secret**

### Task 3.2: Configure in Supabase

1. **Supabase Dashboard** → Authentication → Providers
2. **Enable GitHub provider**
3. **Add GitHub Client ID and Secret**

### Task 3.3: Implement GitHub Sign In

**File**: `components/auth/github-signin.tsx`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function GitHubSignIn() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGitHubSignIn = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with GitHub:', error);
      alert('Failed to sign in with GitHub');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGitHubSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
      {loading ? 'Signing in...' : 'Continue with GitHub'}
    </button>
  );
}
```

## Part 4: Handle OAuth User Data (10 minutes)

### Task 4.1: Create Profile on OAuth Sign In

OAuth users might not have a profile yet. Create one automatically.

**File**: `app/auth/callback/route.ts` (update)

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${error.message}`);
    }

    // Check if profile exists, create if not
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create profile for OAuth user
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.full_name || data.user.user_metadata.name,
          avatar_url: data.user.user_metadata.avatar_url,
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

### Task 4.2: Display OAuth User Info

**File**: `app/dashboard/page.tsx` (update)

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/sign-out-button';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name || 'User'}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              Welcome back, {profile?.name || user.email}!
            </h2>
            <p className="text-gray-600">{user.email}</p>
            {user.app_metadata.provider && (
              <p className="text-sm text-gray-500">
                Signed in with {user.app_metadata.provider}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rest of dashboard */}
    </div>
  );
}
```

## Part 5: Additional OAuth Providers (5 minutes)

### Add More Providers

Supabase supports many OAuth providers. The pattern is the same:

**Available Providers**:
- Google ✅
- GitHub ✅
- Facebook
- Twitter
- Discord
- GitLab
- Bitbucket
- Azure
- Apple

**Example: Discord**

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'discord',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

## Challenges

### Challenge 1: Link Multiple Providers
Allow users to link multiple OAuth providers to one account.

### Challenge 2: OAuth Scopes
Request additional permissions (e.g., access to user's repos on GitHub).

### Challenge 3: Provider-Specific Data
Store provider-specific data (e.g., GitHub username, Google profile picture).

### Challenge 4: Unlink Provider
Allow users to unlink OAuth providers from their account.

### Challenge 5: OAuth Error Handling
Handle various OAuth errors gracefully (denied access, network errors, etc.).

## Common Issues

**"Redirect URI mismatch"**
- Check redirect URI in provider settings matches Supabase callback URL
- Make sure to add both localhost and production URLs

**"User already exists"**
- User might have signed up with email first
- Implement account linking

**"Missing user data"**
- Some providers don't return all data
- Handle missing fields gracefully

**"OAuth popup blocked"**
- Browser blocked popup
- Use redirect flow instead

## Key Takeaways

- OAuth simplifies sign-in for users
- Each provider requires setup in their console
- Supabase handles the OAuth flow
- Always handle OAuth user data (create profiles)
- Test with multiple providers
- Handle errors gracefully

## Next Exercise

Continue to Exercise 04 for user profile management!
