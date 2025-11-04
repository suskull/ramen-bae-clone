# Module 5: Supabase Ecosystem (Your Complete Backend Platform)

## Learning Objectives
- Understand Supabase's core features
- Master the Supabase client library
- Learn Row Level Security (RLS)
- Use Supabase Storage for files
- Implement real-time subscriptions
- Relate Supabase to traditional backend concepts

## 5.1 What is Supabase?

### Traditional Backend vs Supabase

**Traditional Backend (What you'd build):**
```javascript
// You write all this code:
- Express/Fastify server
- PostgreSQL database setup
- Authentication system
- File storage system
- Real-time WebSocket server
- API endpoints for CRUD
- Security and validation
- Deployment configuration
```

**Supabase (What you get out of the box):**
```javascript
// All of this is ready to use:
✅ PostgreSQL database (with GUI)
✅ Authentication (email, OAuth, magic links)
✅ File storage (S3-compatible)
✅ Real-time subscriptions (WebSocket)
✅ Auto-generated REST API
✅ Row Level Security (database-level permissions)
✅ Edge Functions (serverless)
✅ Dashboard for management
```

**WHY Supabase**: Focus on building features, not infrastructure

**Frontend analogy**: Like using a UI library (shadcn/ui) instead of building every component from scratch

## 5.2 Supabase Client: Your Database Interface

### Direct Database Access (The Magic)

**Traditional approach:**
```javascript
// Backend API endpoint
app.get('/api/products', async (req, res) => {
  const products = await db.query('SELECT * FROM products');
  res.json(products);
});

// Frontend calls API
const response = await fetch('/api/products');
const products = await response.json();
```

**Supabase approach:**
```javascript
// Frontend directly queries database (securely!)
const { data: products } = await supabase
  .from('products')
  .select('*');

// No API endpoint needed!
```

**WHY this is safe**: Row Level Security (RLS) policies control what users can access

**Frontend analogy**: Like having a smart database that knows what each user is allowed to see

### Query Builder (Like SQL, but JavaScript)

```typescript
// Basic SELECT
const { data, error } = await supabase
  .from('products')
  .select('*');

// SELECT with specific columns
const { data } = await supabase
  .from('products')
  .select('id, name, price');

// WHERE clause
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', '123')  // WHERE category_id = '123'
  .gte('price', 10)           // AND price >= 10
  .lte('price', 50);          // AND price <= 50

// ORDER BY
const { data } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false });

// LIMIT and OFFSET (pagination)
const { data } = await supabase
  .from('products')
  .select('*')
  .range(0, 9); // First 10 items (0-9)

// JOIN (relationships)
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(name, icon),
    reviews(rating, body)
  `);

// Result:
// {
//   id: 1,
//   name: 'Spicy Mix',
//   category: { name: 'Mixes', icon: '🍜' },
//   reviews: [
//     { rating: 5, body: 'Amazing!' },
//     { rating: 4, body: 'Pretty good' }
//   ]
// }
```

**Frontend analogy**: Like using array methods instead of for loops
```javascript
// Instead of:
const filtered = [];
for (let i = 0; i < products.length; i++) {
  if (products[i].price >= 10 && products[i].price <= 50) {
    filtered.push(products[i]);
  }
}

// You write:
const filtered = products.filter(p => p.price >= 10 && p.price <= 50);
```

### CRUD Operations

```typescript
// CREATE (INSERT)
const { data: newProduct, error } = await supabase
  .from('products')
  .insert({
    name: 'Spicy Mix',
    price: 17.99,
    category_id: '123'
  })
  .select()
  .single();

// READ (SELECT) - covered above

// UPDATE
const { data: updatedProduct, error } = await supabase
  .from('products')
  .update({ price: 19.99 })
  .eq('id', '456')
  .select()
  .single();

// DELETE
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', '456');

// UPSERT (insert or update if exists)
const { data, error } = await supabase
  .from('products')
  .upsert({
    id: '456',
    name: 'Updated Name',
    price: 19.99
  })
  .select();
```

## 5.3 Row Level Security (RLS): Database-Level Permissions

### What is RLS?

**Frontend analogy**: Like having if statements in your database
```javascript
// Frontend: Manual permission check
function getProducts() {
  if (!user.isAuthenticated) {
    throw new Error('Not allowed');
  }
  return products;
}

// RLS: Automatic permission check in database
// User can't even query data they're not allowed to see
```

### RLS Policies

```sql
-- Enable RLS on table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Authenticated users can create products"
ON products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can only update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only see their own cart items
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);
```

### Real-World Example: Shopping Cart

```sql
-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart items
CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own cart items
CREATE POLICY "Users can add to own cart"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own cart items
CREATE POLICY "Users can update own cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own cart items
CREATE POLICY "Users can delete own cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);
```

**Frontend code (automatically secured):**
```typescript
// This query automatically filters to current user's cart
// No need to add WHERE user_id = currentUser.id
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('*, product:products(*)');

// User can't access other users' carts - RLS prevents it!
```

**WHY RLS**: Security at the database level - even if your frontend code has bugs, users can't access unauthorized data

## 5.4 Supabase Storage: File Management

### Upload Files

```typescript
// components/product-image-upload.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ProductImageUpload({ productId }: { productId: string }) {
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
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
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

### Storage Policies (RLS for Files)

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

-- Users can only delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Image Transformations

```typescript
// Get resized image
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl('products/image.jpg', {
    transform: {
      width: 400,
      height: 400,
      resize: 'cover'
    }
  });

// Multiple sizes for responsive images
const sizes = [400, 800, 1200];
const srcSet = sizes.map(width => {
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl('products/image.jpg', {
      transform: { width }
    });
  return `${publicUrl} ${width}w`;
}).join(', ');
```

## 5.5 Real-time Subscriptions

### Listen to Database Changes

```typescript
// components/live-inventory.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveInventory({ productId }: { productId: string }) {
  const [inventory, setInventory] = useState<number>(0);
  const supabase = createClient();
  
  useEffect(() => {
    // Get initial inventory
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
          filter: `id=eq.${productId}`
        },
        (payload) => {
          setInventory(payload.new.inventory);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);
  
  return (
    <div>
      <p>In Stock: {inventory}</p>
      {inventory < 5 && <p className="text-red-500">Only {inventory} left!</p>}
    </div>
  );
}
```

**Frontend analogy**: Like useState, but the state updates automatically when database changes

### Real-time Cart Sync

```typescript
// hooks/use-cart-sync.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch full item with product details
            const { data } = await supabase
              .from('cart_items')
              .select('*, product:products(*)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setCartItems(prev => [...prev, data]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setCartItems(prev =>
              prev.map(item =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCartItems(prev =>
              prev.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  return cartItems;
}
```

**Use case**: User adds item to cart on phone, it instantly appears on their laptop

## 5.6 Database Functions and Triggers

### Automatic Timestamp Updates

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Calculate Average Rating

```sql
-- Function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_average_rating(product_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM reviews
  WHERE product_id = product_uuid;
$$ LANGUAGE SQL;

-- Call from JavaScript
const { data } = await supabase.rpc('calculate_average_rating', {
  product_uuid: '123-456-789'
});
```

### Inventory Management Trigger

```sql
-- Prevent negative inventory
CREATE OR REPLACE FUNCTION check_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inventory < 0 THEN
    RAISE EXCEPTION 'Inventory cannot be negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_product_inventory
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory();
```

## 5.7 Practical Exercise: Build a Wishlist Feature

**Your task**: Implement a complete wishlist system

**Requirements:**
1. Database table with RLS policies
2. Add/remove from wishlist
3. Real-time sync across devices
4. Display wishlist count

**Solution:**

```sql
-- Database schema
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- RLS policies
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
ON wishlist_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
ON wishlist_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
ON wishlist_items FOR DELETE
USING (auth.uid() = user_id);
```

```typescript
// hooks/use-wishlist.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useWishlist(userId: string) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    // Load wishlist
    supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          setWishlist(data.map(item => item.product_id));
        }
        setLoading(false);
      });
    
    // Real-time sync
    const channel = supabase
      .channel('wishlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWishlist(prev => [...prev, payload.new.product_id]);
          } else if (payload.eventType === 'DELETE') {
            setWishlist(prev => prev.filter(id => id !== payload.old.product_id));
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  const addToWishlist = async (productId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: userId, product_id: productId });
    
    if (error) console.error('Failed to add to wishlist:', error);
  };
  
  const removeFromWishlist = async (productId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (error) console.error('Failed to remove from wishlist:', error);
  };
  
  const isInWishlist = (productId: string) => wishlist.includes(productId);
  
  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    count: wishlist.length
  };
}
```

## 5.8 Key Takeaways

- **Supabase = Complete backend** in one platform
- **Query builder** = SQL in JavaScript
- **RLS = Database-level security** that can't be bypassed
- **Storage = S3-compatible** file storage with transformations
- **Real-time = WebSocket subscriptions** built-in
- **Functions/Triggers** = Database-level business logic

## Next Module Preview

In Module 6, we'll learn about Edge Functions - serverless functions for custom backend logic that Supabase can't handle automatically!
