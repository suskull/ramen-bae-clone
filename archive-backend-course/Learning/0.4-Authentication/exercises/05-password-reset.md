# Exercise 05: Password Reset and Email Verification

Implement password reset flow and email verification.

## Learning Objectives

- Implement forgot password flow
- Handle password reset tokens
- Send password reset emails
- Verify email addresses
- Resend verification emails

## Part 1: Password Reset Flow (20 minutes)

### Task 1.1: Forgot Password Page

**File**: `app/forgot-password/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      setSuccess(false);
    } else {
      setMessage('Check your email for the password reset link!');
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      {!success ? (
        <>
          <p className="text-gray-600 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {message && !success && (
              <div className="p-3 bg-red-50 text-red-700 rounded">{message}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700">{message}</p>
        </div>
      )}

      <p className="mt-4 text-center text-sm">
        Remember your password?{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

### Task 1.2: Reset Password Page

**File**: `app/reset-password/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      alert('Password updated successfully!');
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Set New Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {message && (
          <div className="p-3 bg-red-50 text-red-700 rounded">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
```

## Part 2: Email Verification (15 minutes)

### Task 2.1: Email Verification Notice

**File**: `components/auth/email-verification-notice.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EmailVerificationNotice({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const resendVerification = async () => {
    setSending(true);
    setMessage('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setMessage('Failed to resend email');
    } else {
      setMessage('Verification email sent!');
    }

    setSending(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="font-semibold text-yellow-800 mb-2">
        Email Not Verified
      </h3>
      <p className="text-sm text-yellow-700 mb-3">
        Please check your email and click the verification link to activate your
        account.
      </p>
      <button
        onClick={resendVerification}
        disabled={sending}
        className="text-sm text-yellow-800 underline hover:no-underline disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Resend verification email'}
      </button>
      {message && <p className="text-sm text-yellow-700 mt-2">{message}</p>}
    </div>
  );
}
```

### Task 2.2: Show Verification Status

**File**: `app/dashboard/page.tsx` (update)

```typescript
import EmailVerificationNotice from '@/components/auth/email-verification-notice';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Show verification notice if email not confirmed */}
      {!user.email_confirmed_at && (
        <div className="mb-6">
          <EmailVerificationNotice email={user.email!} />
        </div>
      )}

      {/* Rest of dashboard */}
    </div>
  );
}
```

## Challenges

### Challenge 1: Password Strength Meter
Add a visual password strength indicator.

### Challenge 2: Password Requirements
Show password requirements checklist in real-time.

### Challenge 3: Rate Limiting
Limit password reset requests to prevent abuse.

### Challenge 4: Email Templates
Customize password reset email templates in Supabase.

### Challenge 5: Two-Factor Authentication
Implement 2FA for additional security.

## Key Takeaways

- Password reset uses secure tokens
- Always validate password strength
- Email verification prevents fake accounts
- Provide clear user feedback
- Handle edge cases gracefully

## Next Exercise

Continue to Exercise 06 for role-based authorization!
