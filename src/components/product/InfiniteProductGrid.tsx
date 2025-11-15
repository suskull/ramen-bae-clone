'use client'

import { useInView } from 'react-intersection-observer'
import { ProductCard } from './ProductCard'
import { Product, ReviewStats } from '@/lib/supabase/types'
import { ProductCardSkeleton } from '@/components/ui'

interface InfiniteProductGridProps {
  pages: { products: (Product & { reviewStats?: ReviewStats })[] }[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  className?: string
}

export function InfiniteProductGrid({
  pages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  className = '',
}: InfiniteProductGridProps) {
  // Use react-intersection-observer for proper infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Start loading before reaching the bottom
  })

  // Trigger fetch when the sentinel comes into view
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }

  const allProducts = pages.flatMap((page) => page.products)

  // Show initial loading skeletons
  if (isLoading && allProducts.length === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(12)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Show empty state
  if (!isLoading && allProducts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
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

  return (
    <div className={className}>
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Intersection observer target - placed before loading indicator */}
      {hasNextPage && !isFetchingNextPage && (
        <div ref={ref} className="h-10" />
      )}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[...Array(4)].map((_, index) => (
            <ProductCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* End of results message */}
      {!hasNextPage && allProducts.length > 0 && (
        <div className="text-center text-gray-500 mt-8 py-4">
          You've reached the end of the list
        </div>
      )}
    </div>
  )
}
