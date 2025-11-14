import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/lib/supabase/types';

/**
 * Custom hook for cart functionality
 * Provides easy access to cart state and actions
 */
export function useCart() {
  const {
    items,
    isOpen,
    itemCount,
    subtotal,
    gifts,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    syncToSupabase,
    loadFromSupabase,
    clearCartOnLogout,
  } = useCartStore();

  // Helper to add product to cart
  const addToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity);
  };

  // Helper to check if product is in cart
  const isInCart = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  // Helper to get item quantity
  const getItemQuantity = (productId: string) => {
    const item = items.find((item) => item.productId === productId);
    return item?.quantity || 0;
  };

  // Calculate shipping progress (0-100%)
  const shippingProgress = Math.min((subtotal / 40) * 100, 100);

  // Check if free shipping is unlocked
  const hasFreeShipping = subtotal >= 40;

  // Check if free fish cakes are unlocked
  const hasFreeFishCakes = subtotal >= 60;

  // Amount needed for next gift
  const amountToFreeShipping = Math.max(0, 40 - subtotal);
  const amountToFreeFishCakes = Math.max(0, 60 - subtotal);

  return {
    // State
    items,
    isOpen,
    itemCount,
    subtotal,
    gifts,
    
    // Computed values
    shippingProgress,
    hasFreeShipping,
    hasFreeFishCakes,
    amountToFreeShipping,
    amountToFreeFishCakes,
    
    // Actions
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    
    // Helpers
    isInCart,
    getItemQuantity,
    
    // Supabase sync
    syncToSupabase,
    loadFromSupabase,
    clearCartOnLogout,
  };
}
