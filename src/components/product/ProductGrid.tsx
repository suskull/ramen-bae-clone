'use client'

import { ProductCard } from './ProductCard'
import { Product, ReviewStats } from '@/lib/supabase/types'

interface ProductGridProps {
  products: (Product & { reviewStats?: ReviewStats })[]
  isLoading?: boolean
  className?: string
}

// Skeleton component for loading state
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        
        {/* Reviews skeleton */}
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-3 bg-gray-200 rounded w-8 ml-1" />
        </div>
        
        {/* Price skeleton */}
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, isLoading = false, className = '' }: ProductGridProps) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 max-w-sm">
            We couldn't find any products matching your criteria. Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    )
  }

  // Show products grid
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}