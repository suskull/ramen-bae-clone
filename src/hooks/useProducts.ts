'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts, getCategories, getProductBySlug } from '@/lib/api/products'
import { queryKeys } from '@/lib/query-keys'

export function useProducts(
  category: string = 'all',
  limit: number = 20,
  offset: number = 0,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: [...queryKeys.products.list(category), limit, offset],
    queryFn: () => getProducts(category, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes,
    enabled
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => getProductBySlug(slug),
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
