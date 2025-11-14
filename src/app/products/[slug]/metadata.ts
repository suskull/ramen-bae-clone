import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

export async function generateProductMetadata(slug: string): Promise<Metadata> {
  try {
    const supabase = await createClient()
    
    // Fetch product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !product) {
      return generateSEOMetadata({
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
        noIndex: true,
      })
    }

    // Fetch review stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', product.id)

    const reviewCount = reviews?.length || 0
    const averageRating = reviewCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0

    // Get first image
    const images = product.images as any[]
    const image = images?.[0]?.url || '/og-image.jpg'

    return generateSEOMetadata({
      title: product.name,
      description: product.description || `${product.name} - Premium dried ramen topping. ${reviewCount > 0 ? `Rated ${averageRating.toFixed(1)}/5 by ${reviewCount} customers.` : ''}`,
      image,
      path: `/products/${slug}`,
    })
  } catch (error) {
    console.error('Error generating product metadata:', error)
    return generateSEOMetadata({
      title: 'Product',
      description: 'View product details',
    })
  }
}
