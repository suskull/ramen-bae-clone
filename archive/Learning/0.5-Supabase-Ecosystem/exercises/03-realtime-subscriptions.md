# Exercise 03: Real-time Subscriptions

Implement real-time features with Supabase subscriptions.

## Learning Objectives

- Subscribe to database changes
- Handle real-time updates
- Implement live features
- Manage subscriptions
- Optimize real-time performance

## Part 1: Basic Subscriptions (15 minutes)

### Task 1.1: Subscribe to ALL Table Changes

**Use Case**: Product listing page that shows all products and updates in real-time

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveProducts() {
  const [products, setProducts] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Get initial data
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => setProducts(data || []));

    // Subscribe to ALL product changes (no filter)
    const channel = supabase
      .channel('all-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',           // ALL events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'products',
          // NO filter = receives ALL product changes
        },
        (payload) => {
          console.log('Product change received!', payload);
          console.log('Event type:', payload.eventType);
          console.log('Affected product:', payload.new || payload.old);
          
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div>
      <h2>Live Products (All Changes)</h2>
      <p>Listening to: ALL product changes</p>
      {products.map((product) => (
        <div key={product.id} className="border p-2 m-1">
          <strong>{product.name}</strong> - ${product.price}
          <br />
          <small>Inventory: {product.inventory}</small>
        </div>
      ))}
    </div>
  );
}
```

## Part 2: Filtered Subscriptions (15 minutes)

### Task 2.1: Subscribe to SPECIFIC Row Changes

**Use Case**: Product detail page that only cares about ONE product's changes

```typescript
export function LiveInventory({ productId }: { productId: string }) {
  const [inventory, setInventory] = useState(0);
  const [productName, setProductName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    // Get initial product data
    supabase
      .from('products')
      .select('inventory, name')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        if (data) {
          setInventory(data.inventory);
          setProductName(data.name);
        }
      });

    // Subscribe to changes for THIS SPECIFIC product only
    const channel = supabase
      .channel(`single-product-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',                    // ONLY UPDATE events
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,       // FILTER: only this product ID
        },
        (payload) => {
          console.log('Specific product updated!', payload);
          console.log('Product ID:', payload.new.id);
          console.log('New inventory:', payload.new.inventory);
          
          // Only update inventory (we know it's our product)
          setInventory(payload.new.inventory);
          setProductName(payload.new.name);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, supabase]);

  return (
    <div className="border p-4">
      <h3>Live Inventory for: {productName}</h3>
      <p>Listening to: Product ID {productId} only</p>
      <p className="text-lg">In Stock: <strong>{inventory}</strong></p>
      {inventory < 5 && <p className="text-red-500">⚠️ Only {inventory} left!</p>}
      {inventory === 0 && <p className="text-red-600 font-bold">❌ OUT OF STOCK</p>}
    </div>
  );
}
```

### Task 2.2: Compare Both Approaches

```typescript
// Example: Test both subscriptions side by side
export function SubscriptionComparison({ productId }: { productId: string }) {
  const [allChanges, setAllChanges] = useState([]);
  const [specificChanges, setSpecificChanges] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Subscription 1: ALL products (like Task 1.1)
    const allChannel = supabase
      .channel('all-products-demo')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          setAllChanges(prev => [...prev, {
            type: 'ALL',
            event: payload.eventType,
            productId: payload.new?.id || payload.old?.id,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      )
      .subscribe();

    // Subscription 2: SPECIFIC product (like Task 2.1)
    const specificChannel = supabase
      .channel('specific-product-demo')
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          setSpecificChanges(prev => [...prev, {
            type: 'SPECIFIC',
            event: payload.eventType,
            productId: payload.new.id,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(allChannel);
      supabase.removeChannel(specificChannel);
    };
  }, [productId, supabase]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border p-4">
        <h3>Task 1.1: ALL Products</h3>
        <p className="text-sm text-gray-600">Receives: Every product change</p>
        <div className="max-h-40 overflow-y-auto">
          {allChanges.map((change, i) => (
            <div key={i} className="text-xs">
              {change.timestamp}: {change.event} on {change.productId}
            </div>
          ))}
        </div>
      </div>
      
      <div className="border p-4">
        <h3>Task 2.1: Specific Product</h3>
        <p className="text-sm text-gray-600">Receives: Only {productId} updates</p>
        <div className="max-h-40 overflow-y-auto">
          {specificChanges.map((change, i) => (
            <div key={i} className="text-xs">
              {change.timestamp}: {change.event} on {change.productId}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Part 3: Real-time Cart (20 minutes)

### Task 3.1: Live Cart Sync

```typescript
export function useCartSync(userId: string) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Load initial cart
    supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setCartItems(data);
        setLoading(false);
      });

    // Subscribe to cart changes
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${userId}`,
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
              setCartItems((prev) => [...prev, data]);
            }
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

  return { cartItems, loading };
}
```

## Part 4: Presence and Broadcast (15 minutes)

### Task 4.1: Online Users

```typescript
export function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user-id',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: 'current-user-id',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div>
      <p>{onlineUsers.length} users online</p>
    </div>
  );
}
```

## Challenges

### Challenge 1: Live Notifications
Build a real-time notification system.

### Challenge 2: Chat Feature
Implement a simple real-time chat.

### Challenge 3: Collaborative Editing
Allow multiple users to edit simultaneously.

### Challenge 4: Live Dashboard
Create a dashboard with real-time metrics.

### Challenge 5: Typing Indicators
Show when other users are typing.

## Key Takeaways

- Real-time updates happen automatically
- Subscribe to specific events or all
- Filter subscriptions for performance
- Always unsubscribe on cleanup
- Handle all event types (INSERT, UPDATE, DELETE)
- Use presence for online status

## Next Exercise

Continue to Exercise 04 for File Storage!
