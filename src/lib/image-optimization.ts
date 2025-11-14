/**
 * Image Optimization Utilities
 * 
 * This file contains utilities and best practices for image optimization
 * in the Ramen Bae e-commerce application.
 */

/**
 * Image Quality Settings
 * 
 * Different quality levels for different use cases:
 * - Hero/Featured: 90-95 (high quality for above-the-fold content)
 * - Product Detail: 85-90 (good quality for main product images)
 * - Product Cards: 80-85 (balanced quality for grid views)
 * - Thumbnails: 70-75 (lower quality for small images)
 */
export const IMAGE_QUALITY = {
  HERO: 95,
  PRODUCT_DETAIL: 90,
  PRODUCT_CARD: 85,
  THUMBNAIL: 75,
  REVIEW_MEDIA: 75,
} as const

/**
 * Image Sizes Configuration
 * 
 * Responsive sizes for different breakpoints to optimize bandwidth
 */
export const IMAGE_SIZES = {
  // Product cards in grid
  PRODUCT_CARD: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  
  // Product detail carousel
  PRODUCT_DETAIL: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
  
  // Thumbnails
  THUMBNAIL: '80px',
  THUMBNAIL_SMALL: '96px',
  
  // Cart items
  CART_ITEM: '80px',
  
  // Full width hero images
  HERO: '100vw',
} as const

/**
 * Loading Strategy
 * 
 * Determines when images should be loaded:
 * - eager: Load immediately (above-the-fold, critical images)
 * - lazy: Load when near viewport (below-the-fold, non-critical)
 */
export type LoadingStrategy = 'eager' | 'lazy'

/**
 * Get optimal loading strategy based on position
 */
export function getLoadingStrategy(
  isAboveFold: boolean,
  isPriority: boolean = false
): LoadingStrategy {
  return isAboveFold || isPriority ? 'eager' : 'lazy'
}

/**
 * Get optimal quality based on image type
 */
export function getImageQuality(imageType: keyof typeof IMAGE_QUALITY): number {
  return IMAGE_QUALITY[imageType]
}

/**
 * Get responsive sizes string based on image context
 */
export function getImageSizes(sizeType: keyof typeof IMAGE_SIZES): string {
  return IMAGE_SIZES[sizeType]
}

/**
 * Image Optimization Best Practices
 * 
 * 1. Format Selection:
 *    - Next.js automatically serves WebP with PNG fallback
 *    - Configured in next.config.ts: formats: ['image/webp', 'image/png']
 * 
 * 2. Lazy Loading:
 *    - Use loading="lazy" for below-the-fold images
 *    - Use loading="eager" or priority for above-the-fold images
 *    - First product carousel image should have priority={true}
 * 
 * 3. Responsive Sizing:
 *    - Always provide sizes prop for responsive images
 *    - Use appropriate sizes based on layout breakpoints
 *    - Helps browser select optimal image size
 * 
 * 4. Quality Settings:
 *    - Hero images: 90-95 quality
 *    - Product images: 85-90 quality
 *    - Thumbnails: 70-75 quality
 *    - Balance quality vs file size
 * 
 * 5. Image Dimensions:
 *    - Use fill prop for responsive containers
 *    - Provide width/height for fixed-size images
 *    - Prevents layout shift (CLS)
 * 
 * 6. Alt Text:
 *    - Always provide descriptive alt text
 *    - Improves accessibility and SEO
 * 
 * 7. Remote Images:
 *    - Configure remotePatterns in next.config.ts
 *    - Includes Supabase storage URLs
 *    - Enables image optimization for external sources
 */

/**
 * Example Usage:
 * 
 * ```tsx
 * import Image from 'next/image'
 * import { getImageQuality, getImageSizes, getLoadingStrategy } from '@/lib/image-optimization'
 * 
 * // Product card image
 * <Image
 *   src={product.image}
 *   alt={product.name}
 *   fill
 *   sizes={getImageSizes('PRODUCT_CARD')}
 *   quality={getImageQuality('PRODUCT_CARD')}
 *   loading={getLoadingStrategy(false)}
 * />
 * 
 * // Hero image (above the fold)
 * <Image
 *   src={heroImage}
 *   alt="Hero banner"
 *   fill
 *   sizes={getImageSizes('HERO')}
 *   quality={getImageQuality('HERO')}
 *   priority
 * />
 * 
 * // Thumbnail
 * <Image
 *   src={thumbnail}
 *   alt="Product thumbnail"
 *   fill
 *   sizes={getImageSizes('THUMBNAIL')}
 *   quality={getImageQuality('THUMBNAIL')}
 *   loading="lazy"
 * />
 * ```
 */

/**
 * Performance Metrics to Monitor:
 * 
 * - Largest Contentful Paint (LCP): Should be < 2.5s
 * - Cumulative Layout Shift (CLS): Should be < 0.1
 * - First Input Delay (FID): Should be < 100ms
 * - Image load time: Monitor via Network tab
 * - Total page weight: Keep images optimized
 */

export default {
  IMAGE_QUALITY,
  IMAGE_SIZES,
  getLoadingStrategy,
  getImageQuality,
  getImageSizes,
}
