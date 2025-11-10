/**
 * Example component demonstrating cart usage
 * This file shows how to integrate the cart store into components
 */

'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { ProgressBar } from './ProgressBar';
import type { Product } from '@/lib/supabase/types';

export function CartExample() {
  const {
    items,
    itemCount,
    subtotal,
    gifts,
    hasFreeShipping,
    hasFreeFishCakes,
    amountToFreeShipping,
    amountToFreeFishCakes,
    addToCart,
    openCart,
  } = useCart();

  // Example: Add product to cart
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // Cart will automatically open when item is added
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cart Example</h2>
      
      {/* Cart Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <p className="font-semibold">Items in cart: {itemCount}</p>
        <p className="font-semibold">Subtotal: ${subtotal.toFixed(2)}</p>
        
        {/* Progress Bar Component */}
        <ProgressBar subtotal={subtotal} gifts={gifts} />
      </div>

      {/* Cart Items using CartItem component */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
        ) : (
          <div>
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openCart}
        className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Open Cart Sidebar
      </button>
    </div>
  );
}
