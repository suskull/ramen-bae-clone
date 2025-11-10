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
  sessionId: string | null;
  
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
  loadFromSupabase: (userId: string) => Promise<void>;
}

// Gift thresholds configuration
const GIFT_THRESHOLDS: Gift[] = [
  { id: 'free-shipping', name: 'Free Shipping', threshold: 40, unlocked: false },
  { id: 'free-fish-cakes', name: 'Free Fish Cakes', threshold: 60, unlocked: false },
];

// Generate a session ID for guest users
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      cartId: null,
      sessionId: null,
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

          const subtotal = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          const gifts = GIFT_THRESHOLDS.map((gift) => ({
            ...gift,
            unlocked: subtotal >= gift.threshold,
          }));

          return {
            items: newItems,
            subtotal,
            itemCount,
            gifts,
            isOpen: true, // Open cart when item is added
          };
        });

        // Sync to Supabase after state update
        get().syncToSupabase();
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.productId !== productId
          );

          const subtotal = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          const gifts = GIFT_THRESHOLDS.map((gift) => ({
            ...gift,
            unlocked: subtotal >= gift.threshold,
          }));

          return {
            items: newItems,
            subtotal,
            itemCount,
            gifts,
          };
        });

        // Sync to Supabase after state update
        get().syncToSupabase();
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

          const subtotal = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          const gifts = GIFT_THRESHOLDS.map((gift) => ({
            ...gift,
            unlocked: subtotal >= gift.threshold,
          }));

          return {
            items: newItems,
            subtotal,
            itemCount,
            gifts,
          };
        });

        // Sync to Supabase after state update
        get().syncToSupabase();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          itemCount: 0,
          gifts: GIFT_THRESHOLDS,
        });

        // Sync to Supabase after state update
        get().syncToSupabase();
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      syncToSupabase: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          const state = get();
          let { cartId, sessionId } = state;

          // Generate session ID if not exists
          if (!sessionId) {
            sessionId = generateSessionId();
            set({ sessionId });
          }

          // Create or update cart in Supabase
          if (!cartId) {
            const { data: cart, error: cartError } = await supabase
              .from('carts')
              .insert({
                user_id: user?.id || null,
                session_id: sessionId,
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

          // Delete existing cart items
          await supabase.from('cart_items').delete().eq('cart_id', cartId);

          // Insert current cart items
          if (state.items.length > 0) {
            const cartItems = state.items.map((item) => ({
              cart_id: cartId,
              product_id: item.productId,
              quantity: item.quantity,
            }));

            const { error: itemsError } = await supabase
              .from('cart_items')
              .insert(cartItems);

            if (itemsError) {
              console.error('Error syncing cart items:', itemsError);
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

          const subtotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          const gifts = GIFT_THRESHOLDS.map((gift) => ({
            ...gift,
            unlocked: subtotal >= gift.threshold,
          }));

          set({
            items,
            cartId: cart.id,
            sessionId: cart.session_id,
            subtotal,
            itemCount,
            gifts,
          });
        } catch (error) {
          console.error('Error loading cart from Supabase:', error);
        }
      },
    }),
    {
      name: 'ramen-bae-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        sessionId: state.sessionId,
      }),
    }
  )
);
