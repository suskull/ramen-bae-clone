# Exercise 06: Complete Integration

Build a complete feature using all Supabase capabilities.

## Learning Objectives

- Integrate query builder, RLS, real-time, and storage
- Build a complete wishlist feature
- Implement best practices
- Handle edge cases
- Optimize performance

## Project: Complete Wishlist System

Build a wishlist feature with:
- Add/remove products
- Real-time sync across devices
- Share wishlist with others
- Product images
- Notifications

## Part 1: Database Schema (10 minutes)

```sql
-- Wishlist table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own wishlist"
ON wishlist_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
ON wishlist_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
ON wishlist_items FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX wishlist_items_user_id_idx ON wishlist_items(user_id);
CREATE INDEX wishlist_items_product_id_idx ON wishlist_items(product_id);
```

## Part 2: Wishlist Hook (20 minutes)

```typescript
// hooks/use-wishlist.ts
'use client';

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
          setWishlist(data.map((item) => item.product_id));
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
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWishlist((prev) => [...prev, payload.new.product_id]);
          } else if (payload.eventType === 'DELETE') {
            setWishlist((prev) =>
              prev.filter((id) => id !== payload.old.product_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const addToWishlist = async (productId: string, notes?: string) => {
    const { error } = await supabase.from('wishlist_items').insert({
      user_id: userId,
      product_id: productId,
      notes,
    });

    if (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    count: wishlist.length,
  };
}
```

## Part 3: Wishlist Components (20 minutes)

```typescript
// components/wishlist-button.tsx
'use client';

import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/contexts/auth-context';

export function WishlistButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist(
    user?.id || ''
  );

  if (!user) return null;

  const inWishlist = isInWishlist(productId);

  const handleClick = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      alert('Failed to update wishlist');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded ${
        inWishlist ? 'bg-red-500 text-white' : 'bg-gray-200'
      }`}
    >
      {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
    </button>
  );
}
```

## Part 4: Wishlist Page (20 minutes)

```typescript
// app/wishlist/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/helpers';
import WishlistGrid from '@/components/wishlist-grid';

export default async function WishlistPage() {
  const user = await getUser();
  const supabase = createClient();

  const { data: wishlistItems } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      product:products(
        *,
        category:categories(name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlistItems && wishlistItems.length > 0 ? (
        <WishlistGrid items={wishlistItems} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Your wishlist is empty</p>
          <a href="/products" className="text-blue-500 hover:underline mt-2">
            Browse products
          </a>
        </div>
      )}
    </div>
  );
}
```

## Challenges

### Challenge 1: Share Wishlist
Allow users to share wishlist with public link.

### Challenge 2: Wishlist Collections
Organize wishlist into collections/categories.

### Challenge 3: Price Alerts
Notify when wishlist item goes on sale.

### Challenge 4: Wishlist Analytics
Track most wishlisted products.

### Challenge 5: Export Wishlist
Export wishlist to PDF or email.

## Key Takeaways

- Combine all Supabase features
- Use RLS for security
- Real-time for better UX
- Optimize queries
- Handle errors gracefully
- Test thoroughly

## Module Complete!

You've mastered the Supabase Ecosystem! 🎉
