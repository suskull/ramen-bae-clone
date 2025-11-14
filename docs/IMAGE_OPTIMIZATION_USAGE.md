# Image Optimization Utility Usage

This document shows how the image optimization utilities are used throughout the application.

## Utility Functions

Located in `src/lib/image-optimization.ts`:

```typescript
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'
```

### Available Functions

1. **`getImageQuality(type)`** - Returns optimal quality for image type
2. **`getImageSizes(type)`** - Returns responsive sizes string
3. **`getLoadingStrategy(isAboveFold, isPriority)`** - Returns loading strategy

### Available Constants

```typescript
IMAGE_QUALITY = {
  HERO: 95,
  PRODUCT_DETAIL: 90,
  PRODUCT_CARD: 85,
  THUMBNAIL: 75,
  REVIEW_MEDIA: 75,
}

IMAGE_SIZES = {
  PRODUCT_CARD: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  PRODUCT_DETAIL: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
  THUMBNAIL: '80px',
  THUMBNAIL_SMALL: '96px',
  CART_ITEM: '80px',
  HERO: '100vw',
}
```

## Component Usage Examples

### 1. ProductCard Component

**File:** `src/components/product/ProductCard.tsx`

```tsx
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

// Main product image
<Image
  src={mainImage.url}
  alt={mainImage.alt || product.name}
  fill
  sizes={getImageSizes('PRODUCT_CARD')}
  loading="lazy"
  quality={getImageQuality('PRODUCT_CARD')}
/>

// Hover image
<Image
  src={hoverImage.url}
  alt={hoverImage.alt || `${product.name} alternate view`}
  fill
  sizes={getImageSizes('PRODUCT_CARD')}
  loading="lazy"
  quality={getImageQuality('PRODUCT_CARD')}
/>
```

**Result:**
- Quality: 85
- Sizes: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
- Loading: lazy (below-the-fold)

---

### 2. ProductCarousel Component

**File:** `src/components/product/ProductCarousel.tsx`

```tsx
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

// Main carousel image
<Image
  src={currentImage.url}
  alt={currentImage.alt || `${productName} - Image ${currentIndex + 1}`}
  fill
  sizes={getImageSizes('PRODUCT_DETAIL')}
  priority={currentIndex === 0}
  quality={getImageQuality('PRODUCT_DETAIL')}
  loading={currentIndex === 0 ? 'eager' : 'lazy'}
/>

// Thumbnail images
<Image
  src={image.url}
  alt={image.alt || `${productName} thumbnail ${index + 1}`}
  fill
  sizes={getImageSizes('THUMBNAIL')}
  loading="lazy"
  quality={getImageQuality('THUMBNAIL')}
/>
```

**Result:**
- Main image quality: 90
- Main image sizes: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px`
- Thumbnail quality: 75
- Thumbnail sizes: `80px`
- First image: priority loading
- Other images: lazy loading

---

### 3. CartItem Component

**File:** `src/components/cart/CartItem.tsx`

```tsx
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

// Cart item thumbnail
<Image
  src={item.image}
  alt={item.name}
  fill
  sizes={getImageSizes('CART_ITEM')}
  loading="lazy"
  quality={getImageQuality('THUMBNAIL')}
/>
```

**Result:**
- Quality: 75
- Sizes: `80px`
- Loading: lazy

---

### 4. ReviewCard Component

**File:** `src/components/reviews/ReviewCard.tsx`

```tsx
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

// Review image
<Image
  src={item.url}
  alt={`Review media ${index + 1}`}
  fill
  sizes={getImageSizes('THUMBNAIL_SMALL')}
  loading="lazy"
  quality={getImageQuality('REVIEW_MEDIA')}
/>

// Review video thumbnail
<Image
  src={item.thumbnail || item.url}
  alt={`Review video ${index + 1}`}
  fill
  sizes={getImageSizes('THUMBNAIL_SMALL')}
  loading="lazy"
  quality={getImageQuality('REVIEW_MEDIA')}
/>
```

**Result:**
- Quality: 75
- Sizes: `96px`
- Loading: lazy

---

## Benefits of Using Utilities

### 1. Consistency
All components use the same quality and size settings for similar image types.

### 2. Maintainability
Change quality or sizes in one place (`image-optimization.ts`) and all components update.

### 3. Type Safety
TypeScript ensures you use valid image types:
```typescript
getImageQuality('PRODUCT_CARD') // ✅ Valid
getImageQuality('INVALID_TYPE') // ❌ TypeScript error
```

### 4. Documentation
Constants are self-documenting - developers know what each setting means.

### 5. Easy Updates
Need to adjust product card quality? Just update the constant:
```typescript
IMAGE_QUALITY = {
  PRODUCT_CARD: 90, // Changed from 85
}
```

---

## Adding New Image Types

To add a new image type:

1. **Add to constants:**
```typescript
export const IMAGE_QUALITY = {
  // ... existing
  NEW_TYPE: 80,
}

export const IMAGE_SIZES = {
  // ... existing
  NEW_TYPE: '(max-width: 768px) 50vw, 25vw',
}
```

2. **Use in component:**
```tsx
<Image
  quality={getImageQuality('NEW_TYPE')}
  sizes={getImageSizes('NEW_TYPE')}
/>
```

---

## Quick Reference Table

| Component | Image Type | Quality | Sizes | Loading |
|-----------|-----------|---------|-------|---------|
| ProductCard | Main/Hover | 85 | Responsive grid | lazy |
| ProductCarousel | Main | 90 | Responsive detail | eager (first), lazy (rest) |
| ProductCarousel | Thumbnails | 75 | 80px | lazy |
| CartItem | Thumbnail | 75 | 80px | lazy |
| ReviewCard | Media | 75 | 96px | lazy |

---

## Testing Utility Usage

### Verify in Browser
1. Open DevTools Network tab
2. Filter by "Img"
3. Check image URLs contain quality parameter
4. Verify correct sizes are loaded per viewport

### Example Network Request
```
/_next/image?url=...&w=828&q=85
                          ^^
                          Quality from utility
```

---

## Best Practices

1. **Always use utilities** instead of hardcoded values
2. **Import at component level** for better tree-shaking
3. **Use TypeScript** to catch invalid types
4. **Document custom types** if you add new ones
5. **Test changes** after updating constants

---

## Migration Guide

If you have existing hardcoded values:

### Before
```tsx
<Image
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### After
```tsx
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

<Image
  quality={getImageQuality('PRODUCT_CARD')}
  sizes={getImageSizes('PRODUCT_CARD')}
/>
```

---

## Summary

All image components now use centralized utility functions for:
- ✅ Consistent quality settings
- ✅ Responsive sizing
- ✅ Easy maintenance
- ✅ Type safety
- ✅ Self-documenting code

This ensures optimal performance and maintainability across the entire application.
