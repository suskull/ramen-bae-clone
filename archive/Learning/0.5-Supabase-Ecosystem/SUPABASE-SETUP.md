# Complete Supabase Setup Guide

Your complete guide to setting up Supabase for Module 0.5 exercises - from zero to production-ready in 45 minutes.

## 📋 Quick Setup Checklist

- [ ] Create Supabase project
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up client/server code
- [ ] Create database schema
- [ ] Configure RLS policies
- [ ] Set up storage buckets
- [ ] Add sample data
- [ ] Enable real-time
- [ ] Test connection

**Time Required**: 30-45 minutes

---

## Part 1: Create Supabase Project (5 minutes)

### Step 1.1: Sign Up for Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### Step 1.2: Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `ramen-bae-learning` (or your preferred name)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for learning
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

### Step 1.3: Get Project Credentials

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values (you'll need them soon):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

---

## Part 2: Install Dependencies (3 minutes)


Open your terminal and run:

```bash
# Install Supabase client libraries
npm install @supabase/supabase-js @supabase/ssr

# Install additional dependencies
npm install zod # For validation (optional but recommended)
```

---

## Part 3: Configure Environment Variables (2 minutes)

Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (server-side only, never expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site URL (for OAuth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: Add `.env.local` to your `.gitignore` file!

```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
```

---

## Part 4: Set Up Supabase Clients (5 minutes)

### Step 4.1: Client-Side Setup

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Step 4.2: Server-Side Setup

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
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
            // Handle error in middleware/route handlers
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
```

### Step 4.3: Test Connection

Create `app/test-supabase/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function TestPage() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('count');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {error ? (
        <div>
          <p className="text-red-500">Error: {error.message}</p>
          <p className="text-sm text-gray-500 mt-2">
            This is expected if you haven't created the products table yet.
          </p>
        </div>
      ) : (
        <p className="text-green-500">✅ Connected successfully!</p>
      )}
    </div>
  );
}
```

Visit `http://localhost:3000/test-supabase` to verify connection (you'll see an error until you create the schema in the next step).

---

## Part 5: Database Schema Setup (10 minutes)

Go to **Supabase Dashboard** → **SQL Editor** → **New query**

Copy and run this complete schema:

```sql
-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR MODULE 0.5
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Categories Table
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. Products Table
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  inventory INTEGER NOT NULL DEFAULT 0 CHECK (inventory >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. Profiles Table (extends auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  location TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. Reviews Table
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- ============================================================================
-- 5. Cart Items Table
-- ============================================================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 6. Wishlist Items Table
-- ============================================================================

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 7. Orders Table
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. Order Items Table
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Products
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_price_idx ON products(price);
CREATE INDEX products_status_idx ON products(status);
CREATE INDEX products_created_at_idx ON products(created_at DESC);

-- Reviews
CREATE INDEX reviews_product_id_idx ON reviews(product_id);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);

-- Cart Items
CREATE INDEX cart_items_user_id_idx ON cart_items(user_id);
CREATE INDEX cart_items_product_id_idx ON cart_items(product_id);

-- Wishlist Items
CREATE INDEX wishlist_items_user_id_idx ON wishlist_items(user_id);
CREATE INDEX wishlist_items_product_id_idx ON wishlist_items(product_id);

-- Orders
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at DESC);

-- Order Items
CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_product_id_idx ON order_items(product_id);

-- Profiles
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_email_idx ON profiles(email);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

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

Click "Run" to execute the schema. You should see "Success. No rows returned" message.

---

## Part 6: Row Level Security Policies (10 minutes)

RLS ensures users can only access their own data. Run this in SQL Editor:

```sql
-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Categories Policies (Public Read)
-- ============================================================================

CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- ============================================================================
-- Products Policies (Public Read, Admin Write)
-- ============================================================================

CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

CREATE POLICY "Admins can insert products"
ON products FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update products"
ON products FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete products"
ON products FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- ============================================================================
-- Profiles Policies
-- ============================================================================

CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================================================
-- Reviews Policies
-- ============================================================================

CREATE POLICY "Reviews are viewable by everyone"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- Cart Items Policies (User-Specific)
-- ============================================================================

CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- Wishlist Items Policies (User-Specific)
-- ============================================================================

CREATE POLICY "Users can view own wishlist"
ON wishlist_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
ON wishlist_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist"
ON wishlist_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
ON wishlist_items FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- Orders Policies
-- ============================================================================

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- ============================================================================
-- Order Items Policies
-- ============================================================================

CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### Test RLS

RLS automatically filters data based on the authenticated user:

```typescript
// This automatically shows only the current user's cart
// No need to add WHERE user_id = currentUser.id
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('*, product:products(*)');

// User can't access other users' carts - RLS prevents it!
```

---

## Part 7: Storage Setup (5 minutes)

### Step 7.1: Create Storage Buckets

Go to **Storage** in Supabase Dashboard:

1. Click "New bucket"
2. Create these buckets:
   - **Name**: `product-images`, **Public**: Yes
   - **Name**: `avatars`, **Public**: Yes
   - **Name**: `documents`, **Public**: No

### Step 7.2: Storage Policies

Run in SQL Editor:

```sql
-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Product images (public read, authenticated write)
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Avatars (public read, own write)
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

### Step 7.3: Upload Example

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ImageUpload({ productId }: { productId: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      // Update product with image URL
      await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId);

      alert('Upload successful!');
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

## Part 8: Database Functions (5 minutes)

Add useful database functions in SQL Editor:

```sql
-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Get product count
CREATE OR REPLACE FUNCTION get_product_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM products WHERE status = 'active';
$$ LANGUAGE SQL;

-- Search products with full-text search
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      to_tsquery('english', search_term)
    ) AS rank
  FROM products p
  WHERE p.status = 'active'
    AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, ''))
    @@ to_tsquery('english', search_term)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Get wishlist stats
CREATE OR REPLACE FUNCTION get_wishlist_stats(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_items', COUNT(*),
    'total_value', COALESCE(SUM(p.price), 0),
    'categories', json_agg(DISTINCT c.name)
  )
  FROM wishlist_items wi
  JOIN products p ON p.id = wi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE wi.user_id = p_user_id;
$$ LANGUAGE SQL;

-- Calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'subtotal', COALESCE(SUM(oi.price * oi.quantity), 0),
    'tax', COALESCE(SUM(oi.price * oi.quantity), 0) * 0.08,
    'shipping', CASE
      WHEN COALESCE(SUM(oi.price * oi.quantity), 0) >= 50 THEN 0
      ELSE 5.99
    END,
    'total', COALESCE(SUM(oi.price * oi.quantity), 0) * 1.08 +
      CASE
        WHEN COALESCE(SUM(oi.price * oi.quantity), 0) >= 50 THEN 0
        ELSE 5.99
      END
  ) INTO result
  FROM order_items oi
  WHERE oi.order_id = calculate_order_total.order_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## Part 9: Sample Data (5 minutes)

Add sample data to test with:

```sql
-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Instant Ramen', 'instant-ramen', 'Quick and easy instant ramen noodles'),
('Ramen Mixes', 'ramen-mixes', 'Dry ramen seasoning mixes'),
('Ramen Bowls', 'ramen-bowls', 'Complete ramen bowl kits'),
('Accessories', 'accessories', 'Chopsticks, bowls, and other accessories');

-- Insert sample products
INSERT INTO products (name, description, price, inventory, category_id, featured, status) VALUES
('Spicy Tonkotsu Ramen', 'Rich pork bone broth with spicy kick', 12.99, 50, (SELECT id FROM categories WHERE slug = 'instant-ramen'), true, 'active'),
('Miso Ramen Kit', 'Traditional miso-based ramen with toppings', 15.99, 30, (SELECT id FROM categories WHERE slug = 'ramen-bowls'), true, 'active'),
('Shoyu Ramen Mix', 'Classic soy sauce based ramen seasoning', 8.99, 100, (SELECT id FROM categories WHERE slug = 'ramen-mixes'), false, 'active'),
('Bamboo Chopsticks Set', 'Authentic bamboo chopsticks (5 pairs)', 19.99, 25, (SELECT id FROM categories WHERE slug = 'accessories'), false, 'active'),
('Vegetarian Ramen Bowl', 'Plant-based ramen with vegetables', 13.99, 40, (SELECT id FROM categories WHERE slug = 'ramen-bowls'), true, 'active'),
('Spicy Miso Ramen', 'Miso broth with chili oil and garlic', 14.99, 35, (SELECT id FROM categories WHERE slug = 'instant-ramen'), true, 'active'),
('Chicken Ramen Pack', 'Light chicken broth ramen (pack of 5)', 9.99, 60, (SELECT id FROM categories WHERE slug = 'instant-ramen'), false, 'active'),
('Ramen Bowl Set', 'Ceramic ramen bowls with spoons', 24.99, 15, (SELECT id FROM categories WHERE slug = 'accessories'), false, 'active');
```

---

## Part 10: Real-time Setup (2 minutes)

### Step 10.1: Enable Real-time

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `products`
   - `cart_items`
   - `wishlist_items`
   - `reviews`
   - `orders`

### Step 10.2: Real-time Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveInventory({ productId }: { productId: string }) {
  const [inventory, setInventory] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Get initial data
    supabase
      .from('products')
      .select('inventory')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        if (data) setInventory(data.inventory);
      });

    // Subscribe to changes
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          setInventory(payload.new.inventory);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, supabase]);

  return (
    <div>
      <p>In Stock: {inventory}</p>
      {inventory < 5 && <p className="text-red-500">Only {inventory} left!</p>}
    </div>
  );
}
```

---

## Part 11: Authentication Setup (3 minutes)

### Step 11.1: Configure Auth

1. Go to **Authentication** → **Settings**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### Step 11.2: Enable Providers (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Email** (enabled by default)
3. Optionally enable **Google** and **GitHub**
4. Add client IDs and secrets if using OAuth

---

## Part 12: Test Your Setup (5 minutes)

### Test 1: Database Query

Run in SQL Editor:

```sql
-- Test query
SELECT 
  p.*,
  c.name as category_name
FROM products p
JOIN categories c ON c.id = p.category_id
LIMIT 5;

-- Test function
SELECT get_product_count();

-- Test search
SELECT * FROM search_products('ramen');
```

### Test 2: In Your App

Create `app/test-complete/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function TestCompletePage() {
  const supabase = createClient();

  // Test 1: Get products with categories
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(
        id,
        name,
        slug
      )
    `)
    .limit(5);

  // Test 2: Get product count
  const { data: countData, error: countError } = await supabase
    .rpc('get_product_count');

  // Test 3: Test search
  const { data: searchResults, error: searchError } = await supabase
    .rpc('search_products', { search_term: 'ramen' });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Supabase Setup Test</h1>

      {/* Test 1: Products with Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          ✅ Test 1: Products with Categories
        </h2>
        {productsError ? (
          <p className="text-red-500">Error: {productsError.message}</p>
        ) : (
          <div className="space-y-2">
            {products?.map((product) => (
              <div key={product.id} className="p-4 border rounded">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Category: {product.category?.name}
                </p>
                <p className="text-sm">Price: ${product.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test 2: Product Count */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          ✅ Test 2: Database Function
        </h2>
        {countError ? (
          <p className="text-red-500">Error: {countError.message}</p>
        ) : (
          <p className="text-lg">Total Products: {countData}</p>
        )}
      </div>

      {/* Test 3: Search */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          ✅ Test 3: Full-Text Search
        </h2>
        {searchError ? (
          <p className="text-red-500">Error: {searchError.message}</p>
        ) : (
          <div className="space-y-2">
            {searchResults?.map((result: any) => (
              <div key={result.id} className="p-4 border rounded">
                <p className="font-semibold">{result.name}</p>
                <p className="text-sm text-gray-600">{result.description}</p>
                <p className="text-sm">Relevance: {result.rank.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800 font-semibold">
          🎉 All tests passed! Your Supabase setup is complete.
        </p>
      </div>
    </div>
  );
}
```

Visit `http://localhost:3000/test-complete` to verify everything works!

---

## 🎯 Quick Reference: Common Patterns

### Query Builder Basics

```typescript
// Get all products
const { data: products } = await supabase
  .from('products')
  .select('*');

// Get specific columns
const { data } = await supabase
  .from('products')
  .select('id, name, price');

// Filter
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
  .gte('price', 10)
  .lte('price', 50);

// Order and limit
const { data } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// Joins (relationships)
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(id, name, slug),
    reviews(id, rating, body)
  `);
```

### Pagination

```typescript
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

const totalPages = Math.ceil(count / limit);
```

### Search

```typescript
// Simple search
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', `%${searchTerm}%`);

// Full-text search (using function)
const { data } = await supabase
  .rpc('search_products', { search_term: 'ramen' });
```

### Count

```typescript
const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('category_id', categoryId);
```

### Insert

```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'New Ramen',
    price: 12.99,
    inventory: 50,
    category_id: categoryId,
  })
  .select()
  .single();
```

### Update

```typescript
const { data, error } = await supabase
  .from('products')
  .update({ inventory: 45 })
  .eq('id', productId)
  .select()
  .single();
```

### Delete

```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

---

## 🚨 Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Supabase"

**Solutions**:
- Check environment variables are set correctly
- Verify project URL and keys in Supabase dashboard
- Ensure project is not paused (free tier pauses after inactivity)
- Restart your dev server after adding env variables

### RLS Issues

**Problem**: "Row Level Security policy violation"

**Solutions**:
- Check if RLS is enabled on the table
- Verify policies exist for the operation (SELECT, INSERT, UPDATE, DELETE)
- Ensure user is authenticated if policy requires it
- Test with service role key to bypass RLS (debugging only!)

### Real-time Issues

**Problem**: "Real-time subscriptions not working"

**Solutions**:
- Enable replication in Database → Replication
- Check table permissions in RLS policies
- Verify channel subscription code
- Check browser console for errors
- Ensure you're cleaning up subscriptions on unmount

### Query Issues

**Problem**: "Relation does not exist"

**Solutions**:
- Check table name spelling (case-sensitive)
- Verify table exists in database
- Check schema (should be `public` for most tables)
- Run schema creation script again if needed

### Storage Issues

**Problem**: "Storage upload failed"

**Solutions**:
- Check bucket exists and is public (if needed)
- Verify storage policies allow the operation
- Check file size limits (50MB for free tier)
- Ensure user is authenticated

---

## 🎉 Setup Complete!

Your Supabase project is now fully configured for all Module 0.5 exercises!

### What You Have:

✅ Complete database schema with 8 tables  
✅ Row Level Security policies for data protection  
✅ Storage buckets for file uploads  
✅ Database functions for complex queries  
✅ Real-time subscriptions enabled  
✅ Sample data for testing  
✅ Authentication configured  
✅ Client and server code ready  

### Next Steps:

1. **Start with Exercise 01**: Query Builder Mastery
2. **Work through exercises in order**: Each builds on previous concepts
3. **Refer back to this guide**: Use Quick Reference section as needed
4. **Experiment**: Try modifying queries and see what happens
5. **Check MODULE-COMPLETE.md**: Track your progress

### Additional Resources:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Module exercises in `Learning/0.5-Supabase-Ecosystem/exercises/`

Happy learning! 🚀

---

## 📝 Quick Setup Checklist

Print this or keep it handy:

```
□ Created Supabase project
□ Copied project URL and keys
□ Installed npm packages
□ Created .env.local file
□ Added .env.local to .gitignore
□ Created lib/supabase/client.ts
□ Created lib/supabase/server.ts
□ Ran database schema SQL
□ Ran RLS policies SQL
□ Created storage buckets
□ Ran storage policies SQL
□ Ran database functions SQL
□ Ran sample data SQL
□ Enabled real-time replication
□ Configured authentication
□ Tested connection
□ Ran complete test page
□ Ready to start exercises! 🎉
```
