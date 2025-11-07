'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getProducts } from '@/lib/api/products'
import { queryKeys } from '@/lib/query-keys'

const PRODUCTS_PER_PAGE = 12

export function useInfiniteProducts(category: string = 'all') {
  return useInfiniteQuery({
    queryKey: [...queryKeys.products.list(category), 'infinite'],
    queryFn: ({ pageParam = 0 }) => getProducts(category, PRODUCTS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage) => {
      const { products, offset, limit, total } = lastPage
      if (!total || offset + products.length >= total) {
        return undefined // No more pages
      }
      return offset + limit // Next offset
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
