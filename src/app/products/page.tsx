'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/product/ProductGrid'
import { InfiniteProductGrid } from '@/components/product/InfiniteProductGrid'
import { CategoryFilter } from '@/components/product/CategoryFilter'
import { Pagination } from '@/components/ui/pagination'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts'

const PRODUCTS_PER_PAGE = 12

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'
  const pageParam = searchParams.get('page')
  const viewMode = searchParams.get('view') || 'infinite' // 'infinite' or 'pagination'
  const [currentPage, setCurrentPage] = useState(1)
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(viewMode === 'infinite')
  
  // Update current page from URL
  useEffect(() => {
    const page = pageParam ? parseInt(pageParam, 10) : 1
    setCurrentPage(page > 0 ? page : 1)
  }, [pageParam])

  // Update view mode from URL
  useEffect(() => {
    setIsInfiniteScroll(viewMode === 'infinite')
  }, [viewMode])

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [currentCategory])

  const toggleViewMode = () => {
    const newMode = isInfiniteScroll ? 'pagination' : 'infinite'
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newMode)
    params.delete('page') // Reset page when switching modes
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }
  
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE
  
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()

  
  // Pagination mode
  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    error: paginationError, 
    refetch: refetchPagination 
  } = useProducts(currentCategory, PRODUCTS_PER_PAGE, offset, !isInfiniteScroll )

  // Infinite scroll mode
  const {
    data: infiniteData,
    isLoading: isLoadingInfinite,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: infiniteError,
    refetch: refetchInfinite,
  } = useInfiniteProducts(currentCategory, isInfiniteScroll)

  // Use appropriate data based on mode
  const products = isInfiniteScroll 
    ? infiniteData?.pages.flatMap(page => page.products) || []
    : productsData?.products || []
  
  const totalProducts = isInfiniteScroll
    ? infiniteData?.pages[0]?.total || products.length
    : productsData?.total || products.length
  
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  const error = isInfiniteScroll ? infiniteError : paginationError
  const isLoading = isInfiniteScroll ? isLoadingInfinite : isLoadingProducts
  const refetch = isInfiniteScroll ? refetchInfinite : refetchPagination

  const categoryName = currentCategory === 'all' 
    ? 'All Products' 
    : categories.find(cat => cat.slug === currentCategory)?.name || 'Products'

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    // Update URL with page parameter
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {categoryName}
            </h1>
            {/* View mode toggle */}
            <button
              onClick={toggleViewMode}
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-2 touch-manipulation min-h-[44px]"
              title={`Switch to ${isInfiniteScroll ? 'pagination' : 'infinite scroll'}`}
            >
              {isInfiniteScroll ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Pagination</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Infinite Scroll</span>
                </>
              )}
            </button>
            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              className="p-2.5 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Refresh data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our premium dried ramen toppings and elevate your noodle game
          </p>
          {/* Loading indicator */}
          {(isLoading || isLoadingCategories) && (
            <div className="mt-2 text-sm text-primary">
              Loading fresh data...
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.length > 0 ? (
            <CategoryFilter 
              categories={categories}
              className="justify-start sm:justify-center min-w-max sm:min-w-0"
            />
          ) : (
            <div className="flex justify-center">
              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-11 w-24"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-11 w-20"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-11 w-28"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-11 w-16"></div>
                <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse h-11 w-32"></div>
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
              <p className="text-red-600">{error instanceof Error ? error.message : 'An error occurred'}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Products Grid - Infinite Scroll Mode */}
        {!error && isInfiniteScroll && (
          <InfiniteProductGrid
            pages={infiniteData?.pages || []}
            isLoading={isLoadingInfinite}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage || false}
            fetchNextPage={fetchNextPage}
            className="mb-12"
          />
        )}

        {/* Products Grid - Pagination Mode */}
        {!error && !isInfiniteScroll && (
          <>
            <ProductGrid 
              products={products}
              isLoading={isLoading}
              className="mb-12"
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Results Count */}
            {!isLoading && products.length > 0 && (
              <div className="text-center text-gray-600 mt-8">
                Showing {offset + 1}-{Math.min(offset + products.length, totalProducts)} of {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                {currentCategory !== 'all' && ` in ${categoryName}`}
              </div>
            )}
          </>
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