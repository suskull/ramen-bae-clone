# CartSidebar Component

A slide-out shopping cart sidebar built with shadcn's Sheet component that displays cart items, progress toward free shipping/gifts, and checkout functionality.

## Features

- **shadcn Sheet Component**: Uses Radix UI Dialog primitive for robust accessibility
- **Responsive Design**: Full-screen on mobile, 480px sidebar on desktop
- **Slide-out Animation**: Smooth transition with backdrop overlay (built-in)
- **Cart Items Display**: Shows all cart items using CartItem components
- **Progress Tracking**: ProgressBar component shows progress toward free shipping ($40) and free fish cakes ($60)
- **Empty State**: Displays product recommendations when cart is empty
- **Accessibility**: Proper ARIA labels, keyboard navigation (Escape to close), focus management
- **Body Scroll Lock**: Prevents background scrolling when cart is open (handled by Sheet)

## Usage

```tsx
import { CartSidebar } from '@/components/cart/CartSidebar'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <CartSidebar />
    </>
  )
}
```

The CartSidebar automatically manages its open/close state through the cart store. Use the `useCart` hook to control it:

```tsx
import { useCart } from '@/hooks/useCart'

function Header() {
  const { openCart, itemCount } = useCart()
  
  return (
    <button onClick={openCart}>
      Cart ({itemCount})
    </button>
  )
}
```

## Component Structure

```
Sheet (shadcn component)
├── SheetContent (side="right", 480px width)
    ├── SheetHeader
    │   └── SheetTitle (cart title with item count)
    ├── Content (scrollable)
    │   ├── ProgressBar (shipping/gift thresholds)
    │   ├── CartItem list
    │   └── EmptyCart (when no items)
    │       ├── Empty state message
    │       └── Product recommendations
    └── Footer (when items exist)
        ├── Subtotal
        ├── Checkout button
        └── Continue shopping link
```

## shadcn Components Used

- **Sheet**: Main container with open/close state management
- **SheetContent**: Sidebar panel with slide animation
- **SheetHeader**: Header section with proper spacing
- **SheetTitle**: Accessible title with semantic HTML

## State Management

The component uses the Zustand cart store via the `useCart` hook:

- `items`: Array of cart items
- `isOpen`: Boolean controlling sidebar visibility
- `subtotal`: Total price of all items
- `gifts`: Array of gift thresholds with unlock status
- `itemCount`: Total number of items in cart
- `closeCart()`: Function to close the sidebar

## Interactions

1. **Opening**: Automatically opens when items are added to cart, or manually via `openCart()`
2. **Closing**: 
   - Click backdrop overlay (handled by Sheet)
   - Click X button (built-in SheetClose)
   - Press Escape key (handled by Sheet)
   - Click "Continue Shopping"
3. **Checkout**: Click "Proceed to Checkout" button (TODO: implement navigation)

## Benefits of Using shadcn Sheet

- **Accessibility**: Built on Radix UI Dialog with full ARIA support
- **Focus Management**: Automatically traps focus within the sheet
- **Scroll Lock**: Prevents body scrolling when open
- **Keyboard Navigation**: ESC to close, Tab navigation
- **Animation**: Smooth slide-in/out transitions
- **Portal Rendering**: Renders outside DOM hierarchy to avoid z-index issues
- **Customizable**: Easy to style with Tailwind classes

## Empty Cart Recommendations

When the cart is empty, the component displays:
- Empty cart icon and message
- "Start Shopping" button
- Three popular product recommendations:
  - Ultimate Ramen Mix
  - Spicy Garlic Mix
  - Nori Sheets

These are hardcoded for now but can be made dynamic by fetching from the database.

## Styling

- Uses Tailwind CSS with custom brand colors
- Primary color: `#fe90b8`
- Primary dark: `#ff3977`
- Accent color: `#96da2f`
- Smooth transitions (300ms duration)
- Shadow and hover effects

## Testing

Visit `/test-cart-sidebar` to test the component with mock data:
- Open/close cart
- Add items
- Test progress bar thresholds
- View empty state
- Test responsive behavior

## Requirements Satisfied

- ✅ 4.1: Add to cart and open sidebar
- ✅ 4.2: Progress bar for free shipping threshold
- ✅ 4.5: Empty cart with recommendations
- ✅ 4.6: Display cart items and subtotal
- ✅ 4.7: Checkout button
- ✅ 6.4: Full-screen on mobile

## Future Enhancements

- [ ] Dynamic product recommendations based on browsing history
- [ ] Implement actual checkout navigation
- [ ] Add cart animations (item add/remove)
- [ ] Support for product variants
- [ ] Promo code input field
- [ ] Estimated shipping costs
