# Exercise 04: User Profiles and Management

Build a complete user profile system with updates and avatar uploads.

## Learning Objectives

- Create user profiles table
- Implement profile CRUD operations
- Handle avatar uploads
- Update user metadata
- Manage user settings

## Part 1: Database Schema (10 minutes)

### Task 1.1: Create Profiles Table

**Run in Supabase SQL Editor**:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create index
CREATE INDEX profiles_id_idx ON profiles(id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Task 1.2: Auto-Create Profile on Sign Up

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Part 2: Profile API Routes (20 minutes)

### Task 2.1: Get Profile Endpoint

**File**: `app/api/profile/route.ts`

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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
```

### Task 2.2: Update Profile Endpoint

**File**: `app/api/profile/route.ts` (add PATCH method)

```typescript
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
});

export async function PATCH(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(validatedData)
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### Task 2.3: Get Public Profile Endpoint

**File**: `app/api/profile/[id]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url, website, location, created_at')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
```

## Part 3: Profile Page (20 minutes)

### Task 3.1: Profile View Page

**File**: `app/profile/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';
import AvatarUpload from '@/components/profile/avatar-upload';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={profile?.avatar_url}
          />
        </div>

        {/* Profile Info Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <ProfileForm profile={profile} userId={user.id} />
        </div>

        {/* Account Info Section */}
        <div className="bg-gray-50 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">User ID:</span> {user.id}
            </p>
            <p>
              <span className="font-medium">Member since:</span>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
            {user.app_metadata.provider && (
              <p>
                <span className="font-medium">Sign-in method:</span>{' '}
                {user.app_metadata.provider}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 3.2: Profile Form Component

**File**: `components/profile/profile-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
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
  const [website, setWebsite] = useState(profile?.website || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          bio,
          website: website || null,
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage('Profile updated successfully!');
      router.refresh();
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Tell us about yourself"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="City, Country"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes('success')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
```

## Part 4: Avatar Upload (20 minutes)

### Task 4.1: Create Storage Bucket

**Run in Supabase Dashboard** → Storage → Create bucket:
- Name: `avatars`
- Public: Yes

**Or via SQL**:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Task 4.2: Avatar Upload Component

**File**: `components/profile/avatar-upload.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
}: {
  userId: string;
  currentAvatarUrl: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      router.refresh();
      alert('Avatar uploaded successfully!');
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setUploading(true);

    try {
      // Update profile to remove avatar
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      setAvatarUrl(null);
      router.refresh();
      alert('Avatar removed successfully!');
    } catch (error: any) {
      alert('Error removing avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="space-y-2">
          <label className="block">
            <span className="sr-only">Choose avatar</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
          </label>

          {avatarUrl && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove avatar
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG or GIF. Max size 2MB.
        </p>

        {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
      </div>
    </div>
  );
}
```

## Part 5: Public Profile View (10 minutes)

### Task 5.1: Public Profile Page

**File**: `app/profile/[id]/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url, website, location, created_at')
    .eq('id', params.id)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <div className="bg-white border rounded-lg p-8">
        <div className="flex items-start gap-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.name || 'User'}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {profile.name || 'Anonymous User'}
            </h1>

            {profile.location && (
              <p className="text-gray-600 mb-4">📍 {profile.location}</p>
            )}

            {profile.bio && (
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{profile.bio}</p>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                🔗 {profile.website}
              </a>
            )}

            <p className="text-sm text-gray-500 mt-4">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Challenges

### Challenge 1: Profile Completeness
Show a progress bar for profile completeness (name, bio, avatar, etc.).

### Challenge 2: Profile Validation
Add more validation (username uniqueness, URL validation, etc.).

### Challenge 3: Profile Settings
Create a separate settings page for email, password, and privacy settings.

### Challenge 4: Profile Activity
Show user's recent activity (orders, reviews, etc.) on their profile.

### Challenge 5: Profile Themes
Allow users to customize their profile appearance.

## Key Takeaways

- Profiles extend user authentication data
- Use RLS to protect profile data
- Store avatars in Supabase Storage
- Validate and sanitize user input
- Provide good UX for uploads
- Make profiles publicly viewable

## Next Exercise

Continue to Exercise 05 for password reset and email verification!
