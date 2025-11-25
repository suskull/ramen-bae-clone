# Quick Start: Supabase Ecosystem

Master Supabase features in 15 minutes!

## 🚀 Before You Start

Make sure you've completed the setup! If not, follow the **[Complete Setup Guide](./SUPABASE-SETUP.md)** first.

This quick start assumes you have:
- ✅ Supabase project created
- ✅ Database schema set up
- ✅ RLS policies configured
- ✅ Sample data loaded

## What You'll Learn

- Query builder for complex queries
- Row Level Security policies
- Real-time subscriptions
- File upload with storage

## Step 1: Query Builder Basics (3 minutes)

### Simple Queries

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
```

### Joins (Relationships)

```typescript
// Get products with category
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(
      id,
      name,
      slug
    )
  `);

// Get products with reviews
const { data } = await supabase
  .from('products')
  .select(`
    *,
    reviews(
      id,
      rating,
      body,
      user:profiles(name)
    )
  `);
```

## Step 2: Row Level Security (4 minutes)

### Enable RLS

```sql
-- Enable RLS on table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
```

### Create Policies

```sql
-- Users can only see their own cart items
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own cart items
CREATE POLICY "Users can add to own cart"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own cart items
CREATE POLICY "Users can update own cart"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own cart items
CREATE POLICY "Users can delete own cart"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);
```

### Test RLS

```typescript
// This automatically filters to current user's cart
// No need to add WHERE user_id = currentUser.id
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('*, product:products(*)');

// User can't access other users' carts - RLS prevents it!
```

## Step 3: Real-time Subscriptions (4 minutes)

### Listen to Changes

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

### Real-time Cart

```typescript
export function useCartSync(userId: string) {
  const [cartItems, setCartItems] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Load initial cart
    supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setCartItems(data);
      });

    // Subscribe to cart changes
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // All events
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('cart_items')
              .select('*, product:products(*)')
              .eq('id', payload.new.id)
              .single();
            if (data) setCartItems((prev) => [...prev, data]);
          } else if (payload.eventType === 'UPDATE') {
            setCartItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCartItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return cartItems;
}
```

## Step 4: File Storage (4 minutes)

### Upload File

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

### Storage Policies

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Anyone can view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
```

## Quick Patterns

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
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', `%${searchTerm}%`);
```

### Count

```typescript
const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('category_id', categoryId);
```

## Common Issues

**"Row Level Security policy violation"**
- Check your RLS policies
- Verify user is authenticated
- Ensure policy matches your query

**"Relation does not exist"**
- Check table name spelling
- Verify table exists in database
- Check schema (public vs other)

**"Real-time not working"**
- Enable real-time in Supabase dashboard
- Check table replication settings
- Verify channel subscription

## Next Steps

1. **Complete Setup**: If you haven't already, follow [SUPABASE-SETUP.md](./SUPABASE-SETUP.md)
2. **Exercise 01**: Query Builder Mastery
3. **Exercise 02**: RLS Policies
4. **Exercise 03**: Real-time Features
5. **Exercise 04**: File Storage

## Additional Resources

- [Complete Setup Guide](./SUPABASE-SETUP.md) - Full 45-minute setup walkthrough
- [Supabase Reference](./supabase-reference.md) - Quick API reference
- [Module README](./README.md) - Module overview and learning path

Let's master Supabase! 🚀
