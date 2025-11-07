'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, Category, ReviewStats } from '@/lib/supabase/types'

interface ProductWithStats extends Product {
  reviewStats?: ReviewStats
}

interface CacheEntry {
  data: ProductWithStats[]
  timestamp: number
  category: string
}

interface CategoriesCache {
  data: Category[]
  timestamp: number
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// In-memory cache
const productsCache = new Map<string, CacheEntry>()
let categoriesCache: CategoriesCache | null = null

export function useProductsCache() {
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if cache entry is still valid
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION
  }

  // Fetch categories with caching
  const fetchCategories = useCallback(async () => {
    // Check cache first
    if (categoriesCache && isCacheValid(categoriesCache.timestamp)) {
      setCategories(categoriesCache.data)
      return categoriesCache.data
    }

    setIsLoadingCategories(true)
    setError(null)

    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        const fetchedCategories = data.categories || []
        
        // Update cache
        categoriesCache = {
          data: fetchedCategories,
          timestamp: Date.now()
        }
        
        setCategories(fetchedCategories)
        return fetchedCategories
      } else {
        throw new Error(data.error || 'Failed to load categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories'
      setError(errorMessage)
      return []
    } finally {
      setIsLoadingCategories(false)
    }
  }, [])

  // Fetch products with caching
  const fetchProducts = useCallback(async (category: string = 'all') => {
    const cacheKey = category

    // Check cache first
    const cachedEntry = productsCache.get(cacheKey)
    if (cachedEntry && isCacheValid(cachedEntry.timestamp)) {
      setProducts(cachedEntry.data)
      return cachedEntry.data
    }

    setIsLoadingProducts(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (category !== 'all') {
        params.set('category', category)
      }
      
      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        const fetchedProducts = data.products || []
        
        // Update cache
        productsCache.set(cacheKey, {
          data: fetchedProducts,
          timestamp: Date.now(),
          category
        })
        
        setProducts(fetchedProducts)
        return fetchedProducts
      } else {
        throw new Error(data.error || 'Failed to load products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products'
      setError(errorMessage)
      return []
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Clear cache (useful for force refresh)
  const clearCache = useCallback(() => {
    productsCache.clear()
    categoriesCache = null
  }, [])

  // Get cache stats (for debugging)
  const getCacheStats = useCallback(() => {
    return {
      productsCache: Array.from(productsCache.entries()).map(([key, entry]) => ({
        category: key,
        itemCount: entry.data.length,
        age: Date.now() - entry.timestamp,
        isValid: isCacheValid(entry.timestamp)
      })),
      categoriesCache: categoriesCache ? {
        itemCount: categoriesCache.data.length,
        age: Date.now() - categoriesCache.timestamp,
        isValid: isCacheValid(categoriesCache.timestamp)
      } : null
    }
  }, [])

  return {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    error,
    fetchProducts,
    fetchCategories,
    clearCache,
    getCacheStats
  }
}