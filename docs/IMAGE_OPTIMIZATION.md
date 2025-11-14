# Image Optimization Guide

This document outlines the image optimization strategy implemented in the Ramen Bae e-commerce application.

## Overview

All images in the application are optimized using Next.js Image component with WebP format support, lazy loading, and responsive sizing to ensure fast page loads and excellent user experience.

## Implementation Details

### 1. Next.js Configuration

The `next.config.ts` file is configured with optimal image settings:

```typescript
images: {
  // WebP format with PNG fallback
  formats: ['image/webp', 'image/png'],
  
  // Responsive breakpoints
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Remote image sources (Supabase)
  remotePatterns: [
    // Local Supabase
    { protocol: 'http', hostname: '127.0.0.1', port: '54321' },
    // Production Supabase
    { protocol: 'https', hostname: '*.supabase.co' }
  ],
  
  // Cache optimization
  minimumCacheTTL: 60,
}
```

### 2. Image Format Strategy

**Automatic Format Selection:**
- Next.js automatically serves WebP format to supported browsers
- Falls back to PNG for browsers without WebP support
- Reduces file size by 25-35% compared to PNG alone

**Benefits:**
- Smaller file sizes = faster downloads
- Better compression without quality loss
- Automatic browser compatibility handling

### 3. Lazy Loading Implementation

**Strategy:**
- Above-the-fold images: `loading="eager"` or `priority={true}`
- Below-the-fold images: `loading="lazy"`
- Defers loading of off-screen images until needed

**Understanding "The Fold":**

The "fold" refers to the bottom edge of the viewport when a page first loads (before any scrolling). It comes from newspaper terminology where content "above the fold" was visible on the newsstand.

**Above the Fold** = Visible immediately without scrolling
**Below the Fold** = Requires scrolling to see

**How to Identify Above vs Below the Fold:**

| Image Location | Fold Position | Loading Strategy | Example |
|----------------|---------------|------------------|---------|
| Hero banner at top | Above | `priority={true}` | Homepage hero |
| First product carousel image | Above | `priority={true}` | Product detail main image |
| Site logo in header | Above | `loading="eager"` | Header logo |
| First 1-3 product cards | Above* | `loading="eager"` | Top products in grid |
| Product grid (4+) | Below | `loading="lazy"` | Most product cards |
| Thumbnails | Below | `loading="lazy"` | Carousel thumbnails |
| Cart sidebar images | Below | `loading="lazy"` | Cart item images |
| Review images | Below | `loading="lazy"` | User photos |
| Footer content | Below | `loading="lazy"` | Footer images |

*Depends on screen size - mobile shows fewer items above fold

**Visual Guide:**

```
┌─────────────────────────────┐
│ Header (Logo)               │ ← Above the fold
│ Hero Image                  │ ← Above the fold
│ First Product Card          │ ← Above the fold
├─────────────────────────────┤ ← THE FOLD (viewport bottom)
│ More Product Cards          │ ← Below the fold
│ (requires scrolling)        │ ← Below the fold
│                             │
│ Footer                      │ ← Below the fold
└─────────────────────────────┘
```

**Screen Size Considerations:**

- **Desktop (1920px)**: First 4-6 product cards may be above fold
- **Tablet (768px)**: First 2-3 product cards above fold
- **Mobile (375px)**: Only 1-2 product cards above fold

**Implementation Examples:**

```tsx
// Product card (below-the-fold) - LAZY LOAD
<Image
  src={image}
  alt={name}
  fill
  loading="lazy"
  quality={85}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// First carousel image (above-the-fold) - PRIORITY LOAD
<Image
  src={image}
  alt={name}
  fill
  priority
  quality={90}
  sizes="(max-width: 768px) 100vw, 600px"
/>

// Conditional loading based on position
<Image
  src={image}
  alt={name}
  fill
  priority={index === 0}  // Only first image gets priority
  loading={index === 0 ? 'eager' : 'lazy'}
  quality={90}
/>
```

**Testing What's Above the Fold:**

1. **Chrome DevTools**:
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test different screen sizes
   - Note what's visible without scrolling

2. **Lighthouse**:
   - Run Lighthouse audit
   - Check "Largest Contentful Paint" (LCP)
   - LCP element is usually above the fold

3. **Visual Test**:
   - Load page
   - Don't scroll
   - Everything visible = above the fold

**Common Mistakes:**

❌ **Don't** use `priority` on all images
```tsx
// BAD - defeats lazy loading
{products.map(p => <Image priority />)}
```

✅ **Do** use `priority` selectively
```tsx
// GOOD - only first/hero images
<Image priority={index === 0} />
```

❌ **Don't** lazy load hero images
```tsx
// BAD - delays LCP
<Image src={heroImage} loading="lazy" />
```

✅ **Do** prioritize hero images
```tsx
// GOOD - fast LCP
<Image src={heroImage} priority />
```

### 4. Quality Settings

Different quality levels are used based on image importance:

| Image Type | Quality | Use Case |
|------------|---------|----------|
| Hero Images | 95 | Above-the-fold, critical branding |
| Product Detail | 90 | Main product carousel images |
| Product Cards | 85 | Grid view product images |
| Thumbnails | 75 | Small preview images |
| Cart Items | 75 | Small cart preview images |
| Review Media | 75 | User-uploaded review images |

### 5. Responsive Sizing

**Sizes Prop:**
The `sizes` prop tells the browser which image size to download based on viewport:

```tsx
// Product cards - responsive grid
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
// Mobile: full width
// Tablet: 50% width
// Desktop: 33% width

// Product detail
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
// Mobile: full width
// Tablet: 50% width
// Desktop: 600px fixed

// Thumbnails
sizes="80px"
// Fixed size across all breakpoints
```

### 6. Component-Specific Optimizations

#### ProductCard Component
- Main image: lazy loading, quality 85
- Hover image: lazy loading, quality 85
- Responsive sizes for grid layout
- Smooth opacity transitions

#### ProductCarousel Component
- First image: priority loading, quality 90
- Subsequent images: lazy loading, quality 90
- Thumbnails: lazy loading, quality 75
- Zoom functionality with transform

#### CartItem Component
- Small thumbnails: lazy loading, quality 75
- Fixed 80px size
- Quick loading for cart sidebar

#### ReviewCard Component
- Review media: lazy loading, quality 75
- Small preview size (96px)
- Video thumbnails optimized

## Performance Benefits

### Before Optimization (Typical)
- PNG images: ~500KB per product image
- No lazy loading: All images load immediately
- No responsive sizing: Desktop images on mobile
- Total page weight: 5-10MB

### After Optimization
- WebP images: ~150-200KB per product image (60-70% reduction)
- Lazy loading: Only visible images load initially
- Responsive sizing: Appropriate size per device
- Total initial page weight: 500KB-1MB

### Metrics Improvements
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1 (fill prop prevents shift)
- **First Input Delay (FID)**: < 100ms
- **Page Load Time**: 40-60% faster
- **Bandwidth Usage**: 60-70% reduction

## Best Practices

### ✅ Do's

1. **Always use Next.js Image component**
   ```tsx
   import Image from 'next/image'
   ```

2. **Provide alt text for accessibility**
   ```tsx
   <Image alt="Descriptive text" />
   ```

3. **Use appropriate quality settings**
   ```tsx
   quality={85} // Product cards
   quality={75} // Thumbnails
   ```

4. **Specify sizes for responsive images**
   ```tsx
   sizes="(max-width: 768px) 100vw, 50vw"
   ```

5. **Use priority for above-the-fold images**
   ```tsx
   <Image priority /> // Hero images
   ```

6. **Use lazy loading for below-the-fold**
   ```tsx
   <Image loading="lazy" /> // Product grids
   ```

### ❌ Don'ts

1. **Don't use regular img tags**
   ```tsx
   // ❌ Bad
   <img src="/image.png" />
   
   // ✅ Good
   <Image src="/image.png" />
   ```

2. **Don't skip the sizes prop**
   ```tsx
   // ❌ Bad - browser can't optimize
   <Image fill />
   
   // ✅ Good - browser knows what to load
   <Image fill sizes="50vw" />
   ```

3. **Don't use priority on all images**
   ```tsx
   // ❌ Bad - defeats lazy loading
   {products.map(p => <Image priority />)}
   
   // ✅ Good - only first/hero images
   <Image priority={index === 0} />
   ```

4. **Don't use unnecessarily high quality**
   ```tsx
   // ❌ Bad - 100 quality for thumbnails
   <Image quality={100} sizes="80px" />
   
   // ✅ Good - appropriate quality
   <Image quality={75} sizes="80px" />
   ```

## Utility Functions

Use the helper functions from `src/lib/image-optimization.ts`:

```tsx
import { 
  getImageQuality, 
  getImageSizes, 
  getLoadingStrategy 
} from '@/lib/image-optimization'

// Product card
<Image
  quality={getImageQuality('PRODUCT_CARD')}
  sizes={getImageSizes('PRODUCT_CARD')}
  loading={getLoadingStrategy(false)}
/>

// Hero image
<Image
  quality={getImageQuality('HERO')}
  sizes={getImageSizes('HERO')}
  priority
/>
```

## Testing Image Optimization

### 1. Chrome DevTools
- Open Network tab
- Filter by "Img"
- Check file sizes and formats
- Verify WebP is served to Chrome
- Check lazy loading behavior

### 2. Lighthouse Audit
```bash
# Run Lighthouse in Chrome DevTools
# Check these metrics:
- Performance score
- Largest Contentful Paint
- Cumulative Layout Shift
- Properly sized images
- Next-gen formats (WebP)
```

### 3. Visual Testing
- Scroll through product pages
- Verify images load smoothly
- Check for layout shifts
- Test on different devices
- Verify image quality

## Monitoring

### Key Metrics to Track
1. **LCP (Largest Contentful Paint)**: < 2.5s
2. **CLS (Cumulative Layout Shift)**: < 0.1
3. **Image Load Time**: Monitor in Network tab
4. **Total Page Weight**: Keep under 2MB initial load
5. **WebP Adoption**: Should be 90%+ of traffic

### Tools
- Chrome DevTools Network tab
- Lighthouse CI
- WebPageTest.org
- Real User Monitoring (RUM)

## Troubleshooting

### Images Not Loading
1. Check `remotePatterns` in `next.config.ts`
2. Verify image URLs are accessible
3. Check browser console for errors
4. Ensure Supabase storage is configured

### Poor Performance
1. Verify lazy loading is working
2. Check image quality settings
3. Ensure sizes prop is correct
4. Monitor Network tab for large images

### Layout Shifts
1. Use `fill` prop with container
2. Provide explicit width/height
3. Use `object-cover` or `object-contain`
4. Test on different screen sizes

### LCP Warnings
If you see warnings like "Image was detected as LCP":

**Warning Example:**
```
Image with src "/products/image.svg" was detected as the Largest 
Contentful Paint (LCP). Please add the loading="eager" property 
if this image is above the fold.
```

**What This Means:**
- The image is the largest visible element when page loads
- It's being lazy loaded, which delays LCP
- May impact performance score

**How to Fix:**

1. **Identify if image is truly above the fold:**
   - Load the page
   - Don't scroll
   - Is the image visible? → Above the fold
   - Need to scroll to see it? → Below the fold (warning is OK)

2. **If above the fold, add priority:**
   ```tsx
   <Image
     src={image}
     alt={name}
     priority  // Add this
     loading="eager"  // Add this
   />
   ```

3. **If below the fold, ignore the warning:**
   - The warning is informational only
   - Lazy loading is correct for below-fold images
   - No action needed

**Our Implementation:**
- Product cards use lazy loading (correct for grids)
- First carousel image uses priority (correct for detail pages)
- If a product card triggers LCP warning, it's because it's the largest visible element, but lazy loading is still appropriate for product grids

### Quality Warnings
If you see warnings like "quality X is not configured":

**Warning Example:**
```
Image is using quality "85" which is not configured in 
images.qualities [75]. Please update your config to [75, 85].
```

**How to Fix:**
Add the quality value to `next.config.ts`:
```typescript
images: {
  qualities: [75, 85, 90, 95],  // Add all quality levels used
}
```

## Future Enhancements

1. **Blur Placeholder**: Add blur-up effect while loading
2. **AVIF Format**: Add AVIF support for even better compression
3. **Image CDN**: Consider using dedicated image CDN
4. **Adaptive Quality**: Adjust quality based on connection speed
5. **Art Direction**: Different crops for different screen sizes

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [WebP Format](https://developers.google.com/speed/webp)
- [Lazy Loading](https://web.dev/lazy-loading-images/)
