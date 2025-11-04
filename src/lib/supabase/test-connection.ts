/**
 * Test file to verify Supabase connection and database setup
 * Run this from a server component or API route to test the connection
 */

import { createClient } from './server'

export async function testSupabaseConnection() {
  try {
    const supabase = await createClient()
    
    // Test 1: Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return { success: false, error: categoriesError }
    }
    
    console.log('✅ Categories fetched:', categories?.length)
    
    // Test 2: Fetch products with category
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .limit(5)
    
    if (productsError) {
      console.error('Error fetching products:', productsError)
      return { success: false, error: productsError }
    }
    
    console.log('✅ Products fetched:', products?.length)
    
    // Test 3: Fetch reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(5)
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return { success: false, error: reviewsError }
    }
    
    console.log('✅ Reviews fetched:', reviews?.length)
    
    // Test 4: Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      console.error('Error fetching buckets:', bucketsError)
      return { success: false, error: bucketsError }
    }
    
    console.log('✅ Storage buckets:', buckets?.map(b => b.name).join(', '))
    
    return {
      success: true,
      data: {
        categories: categories?.length,
        products: products?.length,
        reviews: reviews?.length,
        buckets: buckets?.map(b => b.name)
      }
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return { success: false, error }
  }
}
