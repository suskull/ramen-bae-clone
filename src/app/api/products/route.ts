import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })

    
    // Filter by category if provided
    if (category && category !== 'all') {
      // First get the category ID by slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }
    
    const { data: products, error, count } = await query
    
    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
    
    // Calculate review stats for each product
    const productsWithStats = await Promise.all(
      (products || []).map(async (product) => {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id)
        
        let reviewStats = {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
        
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
          reviewStats.averageRating = totalRating / reviews.length
          reviewStats.totalReviews = reviews.length
          
          // Calculate rating distribution
          reviews.forEach(review => {
            reviewStats.ratingDistribution[review.rating as keyof typeof reviewStats.ratingDistribution]++
          })
        }
        
        return {
          ...product,
          reviewStats
        }
      })
    )

    return NextResponse.json({ 
      products: productsWithStats,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}