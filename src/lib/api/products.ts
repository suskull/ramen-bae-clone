import { Product, Category, ReviewStats } from '@/lib/supabase/types'

export interface ProductWithStats extends Product {
  reviewStats?: ReviewStats
}

export async function getProducts(category?: string): Promise<ProductWithStats[]> {
  const params = new URLSearchParams()
  if (category && category !== 'all') {
    params.set('category', category)
  }
  
  const response = await fetch(`/api/products?${params.toString()}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load products')
  }
  
  return data.products || []
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load categories')
  }
  
  return data.categories || []
}
