import { Product, Category, ReviewStats } from '@/lib/supabase/types'

export interface ProductWithStats extends Product {
  reviewStats?: ReviewStats
}

export interface ProductsResponse {
  products: ProductWithStats[]
  total: number | null
  limit: number
  offset: number
}

export async function getProducts(
  category?: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<ProductsResponse> {
  const params = new URLSearchParams()
  if (category && category !== 'all') {
    params.set('category', category)
  }
  params.set('limit', limit.toString())
  params.set('offset', offset.toString())
  
  const response = await fetch(`/api/products?${params.toString()}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load products')
  }
  
  return {
    products: data.products || [],
    total: data.total,
    limit: data.limit || limit,
    offset: data.offset || offset,
  }
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load categories')
  }
  
  return data.categories || []
}
