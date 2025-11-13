import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/supabase/types';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

export interface Gift {
  id: string;
  name: string;
  threshold: number;
  unlocked: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  cartId: string | null;
  syncTimeoutId: NodeJS.Timeout | null;
  
  // Computed values
  itemCount: number;
  subtotal: number;
  
  // Gift thresholds
  gifts: Gift[];
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Supabase sync
  syncToSupabase: () => Promise<void>;
  debouncedSync: () => void;
  loadFromSupabase: (userId: string) => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
}

// Gift thresholds configuration
const GIFT_THRESHOLDS: Gift[] = [
  { id: 'free-shipping', name: 'Free Shipping', threshold: 40, unlocked: false },
  { id: 'free-fish-cakes', name: 'Free Fish Cakes', threshold: 60, unlocked: false },
];

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const gifts = GIFT_THRESHOLDS.map((gift) => ({
    ...gift,
    unlocked: subtotal >= gift.threshold,
  }));

  return { subtotal, itemCount, gifts };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      cartId: null,
      syncTimeoutId: null,
      itemCount: 0,
      subtotal: 0,
      gifts: GIFT_THRESHOLDS,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id
          );

          let newItems: CartItem[];

          if (existingItem) {
            // Update quantity of existing item
            newItems = state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            const images = product.images as any;
            const mainImage = Array.isArray(images)
              ? images.find((img: any) => img.type === 'main')?.url || images[0]?.url
              : '/products/placeholder.svg';

            const newItem: CartItem = {
              id: `${product.id}_${Date.now()}`,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: mainImage,
              slug: product.slug,
            };

            newItems = [...state.items, newItem];
          }

          const { subtotal, itemCount, gifts } = calculateCartTotals(newItems);

          return {
            items: newItems,
            subtotal,
            itemCount,
            gifts,
            isOpen: true, // Open cart when item is added
          };
        });

        // Debounced sync to Supabase after state update
        get().debouncedSync();
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.productId !== productId
          );

          const { subtotal, itemCount, gifts } = calculateCartTotals(newItems);

          return {
            items: newItems,
            subtotal,
            itemCount,
            gifts,
          };
        });

        // Debounced sync to Supabase after state update
        get().debouncedSync();
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          const { subtotal, itemCount, gifts } = calculateCartTotals(newItems);

          return {
            items: newItems,
            subtotal,
            itemCount,
            gifts,
          };
        });

        // Debounced sync to Supabase after state update
        get().debouncedSync();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          itemCount: 0,
          gifts: GIFT_THRESHOLDS,
        });

        // Immediate sync for clearCart
        get().syncToSupabase();
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      debouncedSync: () => {
        const state = get();
        
        // Clear existing timeout
        if (state.syncTimeoutId) {
          clearTimeout(state.syncTimeoutId);
        }
        
        // Set new timeout for debounced sync (500ms delay)
        const timeoutId = setTimeout(() => {
          get().syncToSupabase();
          set({ syncTimeoutId: null });
        }, 500);
        
        set({ syncTimeoutId: timeoutId });
      },

      syncToSupabase: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          // Skip sync for guest users - they use localStorage only
          if (!user) {
            return;
          }

          const state = get();
          let { cartId } = state;

          // Create or update cart in Supabase
          if (!cartId) {
            const { data: cart, error: cartError } = await supabase
              .from('carts')
              .insert({
                user_id: user.id,
              })
              .select()
              .single();

            if (cartError) {
              console.error('Error creating cart:', cartError);
              return;
            }

            cartId = cart.id;
            set({ cartId });
          } else {
            // Update cart timestamp
            await supabase
              .from('carts')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', cartId);
          }

          // Get existing cart items from database
          const { data: existingItems } = await supabase
            .from('cart_items')
            .select('product_id, quantity')
            .eq('cart_id', cartId);

          const existingMap = new Map(
            existingItems?.map(item => [item.product_id, item.quantity]) || []
          );

          const currentProductIds = new Set(state.items.map(item => item.productId));

          // Find items to delete (in DB but not in current state)
          const productsToDelete = Array.from(existingMap.keys()).filter(
            productId => !currentProductIds.has(productId)
          );

          // Delete removed items in a single query
          if (productsToDelete.length > 0) {
            await supabase
              .from('cart_items')
              .delete()
              .eq('cart_id', cartId)
              .in('product_id', productsToDelete);
          }

          // Upsert current cart items using the composite unique constraint (cart_id, product_id)
          if (state.items.length > 0) {
            const cartItems = state.items.map((item) => ({
              cart_id: cartId,
              product_id: item.productId,
              quantity: item.quantity,
            }));

            const { error: upsertError } = await supabase
              .from('cart_items')
              .upsert(cartItems, {
                onConflict: 'cart_id,product_id',
                ignoreDuplicates: false,
              });

            if (upsertError) {
              console.error('Error syncing cart items:', upsertError);
            }
          }
        } catch (error) {
          console.error('Error syncing cart to Supabase:', error);
        }
      },

      loadFromSupabase: async (userId: string) => {
        try {
          const supabase = createClient();

          // Find user's cart
          const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (cartError || !cart) {
            console.log('No cart found for user');
            return;
          }

          // Load cart items with product details
          const { data: cartItems, error: itemsError } = await supabase
            .from('cart_items')
            .select(`
              *,
              products (*)
            `)
            .eq('cart_id', cart.id);

          if (itemsError) {
            console.error('Error loading cart items:', itemsError);
            return;
          }

          // Transform to CartItem format
          const items: CartItem[] = cartItems.map((item: any) => {
            const product = item.products;
            const images = product.images as any;
            const mainImage = Array.isArray(images)
              ? images.find((img: any) => img.type === 'main')?.url || images[0]?.url
              : '/products/placeholder.svg';

            return {
              id: item.id,
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              image: mainImage,
              slug: product.slug,
            };
          });

          const { subtotal, itemCount, gifts } = calculateCartTotals(items);

          set({
            items,
            cartId: cart.id,
            subtotal,
            itemCount,
            gifts,
          });
        } catch (error) {
          console.error('Error loading cart from Supabase:', error);
        }
      },

      mergeGuestCart: async (userId: string) => {
        try {
          const supabase = createClient();
          const state = get();
          const guestItems = state.items;

          // If no guest items, just load user cart
          if (guestItems.length === 0) {
            await get().loadFromSupabase(userId);
            return;
          }

          // Find or create user's cart
          let { data: userCart, error: cartError } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (cartError || !userCart) {
            // Create new cart for user
            const { data: newCart, error: createError } = await supabase
              .from('carts')
              .insert({
                user_id: userId,
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating user cart:', createError);
              return;
            }

            userCart = newCart;
          }

          // Load existing cart items
          const { data: existingItems, error: itemsError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', userCart.id);

          if (itemsError) {
            console.error('Error loading existing cart items:', itemsError);
            return;
          }

          // Merge guest items with existing items
          const mergedItems = new Map<string, number>();

          // Add existing items
          existingItems?.forEach((item: any) => {
            mergedItems.set(item.product_id, item.quantity);
          });

          // Add or update with guest items (combine quantities)
          guestItems.forEach((item) => {
            const existingQty = mergedItems.get(item.productId) || 0;
            mergedItems.set(item.productId, existingQty + item.quantity);
          });

          // Upsert merged items using the composite unique constraint
          const itemsToUpsert = Array.from(mergedItems.entries()).map(
            ([productId, quantity]) => ({
              cart_id: userCart.id,
              product_id: productId,
              quantity,
            })
          );

          const { error: upsertError } = await supabase
            .from('cart_items')
            .upsert(itemsToUpsert, {
              onConflict: 'cart_id,product_id',
              ignoreDuplicates: false,
            });

          if (upsertError) {
            console.error('Error merging cart items:', upsertError);
            return;
          }

          // Update cart timestamp
          await supabase
            .from('carts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', userCart.id);

          // Load the merged cart
          await get().loadFromSupabase(userId);
        } catch (error) {
          console.error('Error merging guest cart:', error);
        }
      },
    }),
    {
      name: 'ramen-bae-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate computed values after rehydration
        if (state) {
          const { subtotal, itemCount, gifts } = calculateCartTotals(state.items);
          state.subtotal = subtotal;
          state.itemCount = itemCount;
          state.gifts = gifts;
        }
      },
    }
  )
);
