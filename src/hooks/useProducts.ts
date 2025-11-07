'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts, getCategories } from '@/lib/api/products'
import { queryKeys } from '@/lib/query-keys'

export function useProducts(category: string = 'all') {
  return useQuery({
    queryKey: queryKeys.products.list(category),
    queryFn: () => getProducts(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to invalidate product queries
 * Useful after mutations (create, update, delete)
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient()

  return {
    // Invalidate all products
    invalidateAll: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
    
    // Invalidate specific category
    invalidateCategory: (category: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list(category) }),
    
    // Invalidate specific product detail
    invalidateProduct: (id: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) }),
  }
}

/**
 * Hook to invalidate category queries
 */
export function useInvalidateCategories() {
  const queryClient = useQueryClient()

  return () => 
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
}
