'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Product, ProductImage, ReviewStats } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/utils'
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

interface ProductCardProps {
  product: Product & {
    reviewStats?: ReviewStats
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Parse images from JSON
  const images = (product.images as unknown as ProductImage[]) || []
  const mainImage = images.find(img => img.type === 'main') || images[0]
  const hoverImage = images.find(img => img.type === 'hover') || images[1]
  
  // Check if product is sold out
  const isSoldOut = product.inventory <= 0
  
  // Format prices
  const formattedPrice = formatCurrency(product.price)
  const formattedComparePrice = product.compare_at_price 
    ? formatCurrency(product.compare_at_price)
    : null
  
  // Review stats
  const averageRating = product.reviewStats?.averageRating || 0
  const totalReviews = product.reviewStats?.totalReviews || 0
  
  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div 
        className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {mainImage ? (
            <>
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  isHovered && hoverImage ? 'opacity-0' : 'opacity-100'
                }`}
                sizes={getImageSizes('PRODUCT_CARD')}
                loading="lazy"
                quality={getImageQuality('PRODUCT_CARD')}
              />
              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt={hoverImage.alt || `${product.name} alternate view`}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes={getImageSizes('PRODUCT_CARD')}
                  loading="lazy"
                  quality={getImageQuality('PRODUCT_CARD')}
                />
              )}
            </>
          ) : (
            // Fallback placeholder when no image is available
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm text-center px-4">
                {product.name}
              </span>
            </div>
          )}
          
          {/* Sold Out Badge */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-white text-black font-semibold px-4 py-2 rounded-md text-sm uppercase tracking-wide">
                Sold Out
              </span>
            </div>
          )}
          
          {/* Accent Color Border (subtle) */}
          <div 
            className="absolute inset-0 border-2 border-transparent group-hover:border-opacity-30 transition-all duration-300"
            style={{ borderColor: product.accent_color }}
          />
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {product.name}
          </h3>
          
          {/* Reviews */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : i < averageRating
                        ? 'fill-yellow-200 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                ({totalReviews})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span 
              className="font-bold text-lg"
              style={{ color: product.accent_color }}
            >
              {formattedPrice}
            </span>
            {formattedComparePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formattedComparePrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}