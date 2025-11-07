'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CategoryFilter } from '@/components/product/CategoryFilter'
import { useProductsCache } from '@/hooks/useProductsCache'

function ProductsContent() {
  const searchParams = useSearchParams()
  const {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    error,
    fetchProducts,
    fetchCategories,
    getCacheStats
  } = useProductsCache()

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch products when category changes
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    fetchProducts(category)
  }, [searchParams, fetchProducts])

  const currentCategory = searchParams.get('category') || 'all'
  const categoryName = currentCategory === 'all' 
    ? 'All Products' 
    : categories.find(cat => cat.slug === currentCategory)?.name || 'Products'

    console.log(products, 'products')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {categoryName}
            </h1>
            {/* Cache refresh button */}
            <button
              onClick={() => {
                const category = searchParams.get('category') || 'all'
                fetchProducts(category)
                fetchCategories()
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our premium dried ramen toppings and elevate your noodle game
          </p>
          {/* Loading indicator */}
          {(isLoadingProducts || isLoadingCategories) && (
            <div className="mt-2 text-sm text-primary">
              Loading fresh data...
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          {categories.length > 0 ? (
            <CategoryFilter 
              categories={categories}
              className="justify-center"
            />
          ) : (
            <div className="flex justify-center">
              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-8 w-24"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-8 w-20"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-8 w-28"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-8 w-16"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-8 w-32"></div>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!error && (
          <ProductGrid 
            products={products}
            isLoading={isLoadingProducts}
            className="mb-12"
          />
        )}

        {/* Results Count */}
        {!isLoadingProducts && !error && products.length > 0 && (
          <div className="text-center text-gray-600 mt-8">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
            {currentCategory !== 'all' && ` in ${categoryName}`}
          </div>
        )}

        {/* Debug Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <details>
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                Cache Debug Info
              </summary>
              <pre className="text-gray-600 overflow-auto">
                {JSON.stringify(getCacheStats(), null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}