'use client'

import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from './ProductCard'
import { Product } from '@/lib/supabase/types'

interface RelatedProductsProps {
  currentProduct: Product
  limit?: number
}

export function RelatedProducts({ currentProduct, limit = 4 }: RelatedProductsProps) {
  // Fetch products from the same category
  const { data, isLoading, error } = useProducts(
    currentProduct.category_id || 'all',
    limit + 1, // Fetch one extra to account for filtering out current product
    0,
    true // Enable the query
  )

  if (isLoading) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error loading related products:', error)
    return null
  }

  // Filter out the current product and limit results
  const relatedProducts = data?.products
    .filter(product => product.id !== currentProduct.id)
    .slice(0, limit) || []

  // Don't render if no related products
  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
