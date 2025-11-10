# Cart Store Documentation

## Overview

The cart store is built with Zustand and provides state management for the shopping cart with automatic persistence to localStorage and Supabase.

## Features

- ✅ Add, remove, and update cart items
- ✅ Automatic localStorage persistence
- ✅ Automatic Supabase synchronization
- ✅ Gift threshold tracking (Free Shipping at $40, Free Fish Cakes at $60)
- ✅ Cart sidebar open/close state management
- ✅ Session ID for guest users
- ✅ User cart association for authenticated users

## Usage

### Basic Usage with Hook

```typescript
import { useCart } from '@/hooks/useCart';

function ProductPage({ product }) {
  const { addToCart, itemCount, subtotal } = useCart();

  return (
    <div>
      <button onClick={() => addToCart(product, 1)}>
        Add to Cart
      </button>
      <p>Cart: {itemCount} items (${subtotal.toFixed(2)})</p>
    </div>
  );
}
```

### Direct Store Access

```typescript
import { useCartStore } from '@/stores/cart-store';

function CartButton() {
  const itemCount = useCartStore((state) => state.itemCount);
  const openCart = useCartStore((state) => state.openCart);

  return (
    <button onClick={openCart}>
      Cart ({itemCount})
    </button>
  );
}
```

## API Reference

### State

- `items: CartItem[]` - Array of items in the cart
- `isOpen: boolean` - Cart sidebar open/close state
- `itemCount: number` - Total number of items in cart
- `subtotal: number` - Total price of all items
- `gifts: Gift[]` - Array of gift thresholds with unlock status
- `cartId: string | null` - Supabase cart ID
- `sessionId: string | null` - Session ID for guest users

### Actions

#### `addItem(product: Product, quantity?: number)`
Adds a product to the cart. If the product already exists, increases quantity.

```typescript
const { addToCart } = useCart();
addToCart(product, 2); // Add 2 units
```

#### `removeItem(productId: string)`
Removes an item from the cart completely.

```typescript
const { removeItem } = useCart();
removeItem('product-id');
```

#### `updateQuantity(productId: string, quantity: number)`
Updates the quantity of an item. If quantity is 0 or less, removes the item.

```typescript
const { updateQuantity } = useCart();
updateQuantity('product-id', 5);
```

#### `clearCart()`
Removes all items from the cart.

```typescript
const { clearCart } = useCart();
clearCart();
```

#### `openCart()` / `closeCart()` / `toggleCart()`
Controls the cart sidebar visibility.

```typescript
const { openCart, closeCart, toggleCart } = useCart();
openCart();
```

#### `syncToSupabase()`
Manually sync cart to Supabase. This is called automatically after cart modifications.

```typescript
const { syncToSupabase } = useCart();
await syncToSupabase();
```

#### `loadFromSupabase(userId: string)`
Load user's cart from Supabase when they log in.

```typescript
const { loadFromSupabase } = useCart();
await loadFromSupabase(user.id);
```

## Gift Thresholds

The cart automatically tracks progress toward gift thresholds:

- **Free Shipping**: Unlocked at $40
- **Free Fish Cakes**: Unlocked at $60

Access gift status through the hook:

```typescript
const {
  hasFreeShipping,
  hasFreeFishCakes,
  amountToFreeShipping,
  amountToFreeFishCakes,
  shippingProgress, // 0-100%
} = useCart();
```

## Persistence

### localStorage
Cart state is automatically persisted to localStorage under the key `ramen-bae-cart`. The following fields are persisted:
- `items`
- `cartId`
- `sessionId`

### Supabase
Cart is automatically synced to Supabase after every modification:
- Creates/updates cart in `carts` table
- Syncs items to `cart_items` table
- Associates cart with user ID when authenticated
- Uses session ID for guest users

## Authentication Integration

When a user logs in, load their cart from Supabase:

```typescript
import { useCart } from '@/hooks/useCart';
import { useEffect } from 'react';

function App() {
  const { loadFromSupabase } = useCart();
  const user = useUser(); // Your auth hook

  useEffect(() => {
    if (user?.id) {
      loadFromSupabase(user.id);
    }
  }, [user?.id]);

  return <YourApp />;
}
```

## Types

### CartItem
```typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}
```

### Gift
```typescript
interface Gift {
  id: string;
  name: string;
  threshold: number;
  unlocked: boolean;
}
```

## Example: Cart Sidebar Component

```typescript
'use client';

import { useCart } from '@/hooks/useCart';

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    hasFreeShipping,
    shippingProgress,
    removeItem,
    updateQuantity,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={closeCart} />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
          {!hasFreeShipping && (
            <p className="text-sm mt-2">
              ${(40 - subtotal).toFixed(2)} away from free shipping
            </p>
          )}
          {hasFreeShipping && (
            <p className="text-green-600 font-semibold mt-2">
              Free Shipping Unlocked! 🎉
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20" />
              <div className="flex-1">
                <h3>{item.name}</h3>
                <p>${item.price}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>
              </div>
              <button onClick={() => removeItem(item.productId)}>×</button>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="w-full mt-4 bg-pink-500 text-white py-3 rounded">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Testing

The cart store can be tested by importing it directly:

```typescript
import { useCartStore } from '@/stores/cart-store';

// Get the store instance
const store = useCartStore.getState();

// Test actions
store.addItem(mockProduct, 2);
expect(store.items.length).toBe(1);
expect(store.itemCount).toBe(2);
```
