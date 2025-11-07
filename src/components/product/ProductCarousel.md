# ProductCarousel Component

A fully-featured image carousel component for product detail pages with zoom functionality, thumbnail navigation, and smooth transitions.

## Features

- ✅ **Image Carousel**: Navigate through multiple product images
- ✅ **Thumbnail Navigation**: Click thumbnails to jump to specific images
- ✅ **Zoom on Hover**: 2x magnification with mouse tracking
- ✅ **Navigation Arrows**: Previous/Next buttons for easy browsing
- ✅ **Image Counter**: Shows current image position (e.g., "2 / 5")
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Accessibility**: Proper ARIA labels and keyboard support
- ✅ **Accent Color Support**: Customizable highlight color
- ✅ **Error Handling**: Graceful fallback for missing images

## Usage

```tsx
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { ProductImage } from '@/lib/supabase/types'

const images: ProductImage[] = [
  {
    url: '/products/product-1.jpg',
    alt: 'Product front view',
    type: 'main'
  },
  {
    url: '/products/product-2.jpg',
    alt: 'Product back view',
    type: 'hover'
  },
  {
    url: '/products/product-3.jpg',
    alt: 'Product detail view',
    type: 'gallery'
  }
]

<ProductCarousel
  images={images}
  productName="Ultimate Ramen Mix"
  accentColor="#fe90b8"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `images` | `ProductImage[]` | Yes | - | Array of product images to display |
| `productName` | `string` | Yes | - | Product name used for alt text |
| `accentColor` | `string` | No | `#fe90b8` | Hex color for active thumbnail highlight |
| `className` | `string` | No | - | Additional CSS classes |

## ProductImage Type

```typescript
interface ProductImage {
  url: string
  alt: string
  type: 'main' | 'hover' | 'gallery'
}
```

## Behavior

### Multiple Images
- Shows navigation arrows on hover
- Displays thumbnail strip below main image
- Shows image counter (e.g., "1 / 4")
- Active thumbnail highlighted with accent color

### Single Image
- No navigation arrows
- No thumbnail strip
- No image counter
- Zoom functionality still available

### Zoom Functionality
- Hover over main image to activate 2x zoom
- Move mouse to pan around zoomed area
- Zoom indicator icon appears on hover
- Automatically resets when changing images

## Integration Example

For a product detail page:

```tsx
'use client'

import { ProductCarousel } from '@/components/product/ProductCarousel'
import { Product, ProductImage } from '@/lib/supabase/types'

export default function ProductDetailPage({ product }: { product: Product }) {
  // Parse images from database JSON
  const images = (product.images as unknown as ProductImage[]) || []
  
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left: Image Carousel */}
      <ProductCarousel
        images={images}
        productName={product.name}
        accentColor={product.accent_color}
      />
      
      {/* Right: Product Info */}
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {/* ... rest of product details */}
      </div>
    </div>
  )
}
```

## Testing

A test page is available at `/test-carousel` to see the component in action with sample data.

## Accessibility

- All images have proper alt text
- Navigation buttons have aria-labels
- Keyboard navigation supported
- Focus states visible
- Screen reader friendly

## Performance

- Uses Next.js Image component for optimization
- Lazy loading for non-priority images
- Priority loading for first image
- Responsive image sizes
- Error handling with fallback placeholders
- **Zero re-renders on zoom**: Uses CSS variables and direct DOM manipulation for smooth zoom without React re-renders
- **No image re-fetching**: Image component remains stable during mouse movement

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled for interactive features
