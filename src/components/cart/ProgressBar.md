# ProgressBar Component

## Overview

The `ProgressBar` component displays visual progress toward cart value thresholds that unlock rewards like free shipping and free gifts. It provides real-time feedback to encourage customers to add more items to their cart.

## Features

- **Visual Progress Bar**: Animated progress bar showing cart value progress
- **Threshold Markers**: Visual indicators for $40 (Free Shipping) and $60 (Free Fish Cakes) thresholds
- **Dynamic Messaging**: Context-aware messages based on current cart value
- **Unlocked Badges**: Visual badges when thresholds are reached
- **Smooth Animations**: 500ms transition animations for progress changes

## Props

```typescript
interface ProgressBarProps {
  subtotal: number;      // Current cart subtotal
  gifts: Gift[];         // Array of gift thresholds with unlock status
}

interface Gift {
  id: string;           // Unique identifier (e.g., 'free-shipping')
  name: string;         // Display name (e.g., 'Free Shipping')
  threshold: number;    // Dollar amount threshold
  unlocked: boolean;    // Whether threshold has been reached
}
```

## Usage

### Basic Usage

```tsx
import { ProgressBar } from '@/components/cart/ProgressBar';
import { useCart } from '@/hooks/useCart';

function CartSidebar() {
  const { subtotal, gifts } = useCart();
  
  return (
    <div>
      <ProgressBar subtotal={subtotal} gifts={gifts} />
    </div>
  );
}
```

### With Cart Store

```tsx
import { ProgressBar } from '@/components/cart/ProgressBar';
import { useCartStore } from '@/stores/cart-store';

function MyCart() {
  const subtotal = useCartStore((state) => state.subtotal);
  const gifts = useCartStore((state) => state.gifts);
  
  return (
    <ProgressBar subtotal={subtotal} gifts={gifts} />
  );
}
```

## Behavior

### Progress States

1. **$0 - $39.99**: Shows "Add $X more for Free Shipping"
2. **$40 - $59.99**: Shows "Free Shipping Unlocked! Add $X more for Free Fish Cakes"
3. **$60+**: Shows "Free Shipping & Free Fish Cakes Unlocked!"

### Visual Elements

- **Progress Fill**: Pink gradient (`#fe90b8` to `#F999BF`) that grows from left to right
- **Threshold Markers**: White vertical lines at 66.67% ($40) and 100% ($60) of the bar
- **Message Text**: 
  - Gray for locked states
  - Green (`#96da2f`) for unlocked states
- **Badges**: Green-tinted badges appear when thresholds are unlocked

## Styling

The component uses Tailwind CSS with custom colors from the Ramen Bae brand palette:

- Primary Pink: `#fe90b8` and `#F999BF`
- Accent Green: `#96da2f`
- Neutral Gray: Standard Tailwind grays

## Testing

A test page is available at `/test-progress-bar` that allows you to:
- Adjust cart subtotal with a slider or number input
- Test preset amounts (empty cart, halfway, unlocked states, etc.)
- See real-time updates to the progress bar
- View current unlock status

## Requirements Satisfied

- **Requirement 4.2**: Shows progress toward free shipping threshold ($40)
- **Requirement 4.3**: Displays "Free Shipping" unlocked message at $40
- **Requirement 4.4**: Displays "Free Fish Cakes" unlocked message at $60

## Integration Points

The ProgressBar component integrates with:
- **Cart Store** (`src/stores/cart-store.ts`): Gets subtotal and gift data
- **useCart Hook** (`src/hooks/useCart.ts`): Provides convenient access to cart state
- **CartSidebar** (future): Will display progress in the cart overlay
- **CartExample** (`src/components/cart/CartExample.tsx`): Demonstrates usage

## Accessibility

- Uses semantic HTML with proper ARIA attributes
- Color contrast meets WCAG AA standards
- Text messages provide context for screen readers
- Visual progress is supplemented with text descriptions

## Performance

- Smooth 500ms transitions for progress changes
- Minimal re-renders (only updates when subtotal or gifts change)
- Lightweight component with no external dependencies
