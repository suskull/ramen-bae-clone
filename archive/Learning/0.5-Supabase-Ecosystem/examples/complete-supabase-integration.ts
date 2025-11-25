/**
 * Complete Supabase Integration Example
 * 
 * Demonstrates all Supabase features:
 * - Query builder with complex queries
 * - Row Level Security policies
 * - Real-time subscriptions
 * - File storage
 * - Database functions
 * 
 * Feature: Product Wishlist System
 */

// ============================================================================
// 1. Database Schema
// ============================================================================

/*
-- Wishlist table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX wishlist_items_user_id_idx ON wishlist_items(user_id);
CREATE INDEX wishlist_items_product_id_idx ON wishlist_items(product_id);

-- Trigger for updated_at
CREATE TRIGGER wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Database function
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
*/

// ============================================================================
// 2. TypeScript Types
// ============================================================================

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category?: Category;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// ============================================================================
// 3. Wishlist Hook with Real-time
// ============================================================================

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useWishlist(userId: string) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Load initial wishlist with product details
    async function loadWishlist() {
      const { data, error: fetchError } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          product:products(
            *,
            category:categories(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    loadWishlist();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`wishlist:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch full item with product details
            const { data } = await supabase
              .from('wishlist_items')
              .select(`
                *,
                product:products(
                  *,
                  category:categories(*)
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setItems((prev) => [data, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Add to wishlist
  const addItem = async (productId: string, notes?: string) => {
    const { error: insertError } = await supabase.from('wishlist_items').insert({
      user_id: userId,
      product_id: productId,
      notes: notes || null,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  };

  // Remove from wishlist
  const removeItem = async (productId: string) => {
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  };

  // Update notes
  const updateNotes = async (productId: string, notes: string) => {
    const { error: updateError } = await supabase
      .from('wishlist_items')
      .update({ notes })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product_id === productId);
  };

  // Get wishlist statistics
  const getStats = async () => {
    const { data } = await supabase.rpc('get_wishlist_stats', {
      p_user_id: userId,
    });
    return data;
  };

  return {
    items,
    loading,
    error,
    addItem,
    removeItem,
    updateNotes,
    isInWishlist,
    getStats,
    count: items.length,
  };
}

// ============================================================================
// 4. Wishlist Button Component
// ============================================================================

'use client';

import { useState } from 'react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/contexts/auth-context';

export function WishlistButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { isInWishlist, addItem, removeItem } = useWishlist(user?.id || '');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => (window.location.href = '/login')}
        className="p-2 border rounded hover:bg-gray-50"
      >
        🤍 Sign in to save
      </button>
    );
  }

  const inWishlist = isInWishlist(productId);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await removeItem(productId);
      } else {
        await addItem(productId);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 rounded transition-colors ${
        inWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'border hover:bg-gray-50'
      } disabled:opacity-50`}
    >
      {loading ? '...' : inWishlist ? '❤️ Saved' : '🤍 Save'}
    </button>
  );
}

// ============================================================================
// 5. Wishlist Page
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/helpers';
import WishlistGrid from '@/components/wishlist-grid';

export default async function WishlistPage() {
  const user = await getUser();
  const supabase = createClient();

  // Fetch wishlist with product details
  const { data: wishlistItems } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      product:products(
        *,
        category:categories(name, slug)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get statistics
  const { data: stats } = await supabase.rpc('get_wishlist_stats', {
    p_user_id: user.id,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        {stats && (
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{stats.total_items} items</span>
            <span>Total value: ${stats.total_value.toFixed(2)}</span>
          </div>
        )}
      </div>

      {wishlistItems && wishlistItems.length > 0 ? (
        <WishlistGrid items={wishlistItems} />
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <a
            href="/products"
            className="text-blue-500 hover:underline font-medium"
          >
            Browse products →
          </a>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. API Route for Wishlist Operations
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, notes } = await request.json();

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      user_id: user.id,
      product_id: productId,
      notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

// ============================================================================
// Usage Examples
// ============================================================================

/*

// 1. Add to wishlist
await addItem('product-id-123', 'Want this for birthday');

// 2. Remove from wishlist
await removeItem('product-id-123');

// 3. Check if in wishlist
const saved = isInWishlist('product-id-123');

// 4. Get statistics
const stats = await getStats();
console.log(`${stats.total_items} items worth $${stats.total_value}`);

// 5. Real-time updates work automatically
// When user adds item on phone, it appears on desktop instantly!

*/
