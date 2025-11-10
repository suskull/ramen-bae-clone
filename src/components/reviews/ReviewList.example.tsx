/**
 * Example usage of ReviewList component
 * 
 * This file demonstrates how to use the ReviewList component
 * with sample data and integration patterns.
 */

import { ReviewList } from './ReviewList'
import { Review, ReviewStats } from '@/lib/supabase/types'

// Example: Basic usage with static data
export function BasicReviewListExample() {
  const sampleReviews: Review[] = [
    {
      id: '1',
      product_id: 'product-1',
      user_id: 'user-1',
      user_name: 'Sarah Johnson',
      rating: 5,
      title: 'Amazing quality!',
      body: 'These toppings completely transformed my ramen experience. The quality is outstanding and the flavors are authentic.',
      verified: true,
      media: [],
      helpful: 12,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      product_id: 'product-1',
      user_id: 'user-2',
      user_name: 'Mike Chen',
      rating: 4,
      title: 'Great product',
      body: 'Really good toppings, adds a nice crunch to my ramen. Would definitely buy again.',
      verified: true,
      media: [],
      helpful: 8,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const reviewStats: ReviewStats = {
    averageRating: 4.5,
    totalReviews: 2,
    ratingDistribution: {
      5: 1,
      4: 1,
      3: 0,
      2: 0,
      1: 0,
    },
  }

  const handleHelpful = (reviewId: string) => {
    console.log('Marked review as helpful:', reviewId)
    // In a real app, this would call an API to increment the helpful count
  }

  return (
    <ReviewList
      reviews={sampleReviews}
      reviewStats={reviewStats}
      onHelpful={handleHelpful}
    />
  )
}

// Example: With pagination and load more
export function PaginatedReviewListExample() {
  const sampleReviews: Review[] = Array.from({ length: 25 }, (_, i) => ({
    id: `review-${i + 1}`,
    product_id: 'product-1',
    user_id: `user-${i + 1}`,
    user_name: `Customer ${i + 1}`,
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
    title: `Review ${i + 1}`,
    body: `This is a sample review body for review number ${i + 1}. The product is great!`,
    verified: Math.random() > 0.3,
    media: [],
    helpful: Math.floor(Math.random() * 20),
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))

  const reviewStats: ReviewStats = {
    averageRating: 4.6,
    totalReviews: 25,
    ratingDistribution: {
      5: 15,
      4: 8,
      3: 2,
      2: 0,
      1: 0,
    },
  }

  const handleLoadMore = () => {
    console.log('Loading more reviews...')
    // In a real app, this would fetch more reviews from the API
  }

  return (
    <ReviewList
      reviews={sampleReviews}
      reviewStats={reviewStats}
      onLoadMore={handleLoadMore}
      hasMore={true}
      isLoading={false}
    />
  )
}

// Example: Integration with product page
export function ProductPageReviewsExample() {
  // In a real implementation, you would fetch this data from your API
  // using React Query or similar data fetching library
  
  /*
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId),
  })

  const { data: reviewStats } = useQuery({
    queryKey: ['reviewStats', productId],
    queryFn: () => fetchReviewStats(productId),
  })

  if (isLoading) return <div>Loading reviews...</div>
  if (!reviews || !reviewStats) return null

  return (
    <ReviewList
      reviews={reviews}
      reviewStats={reviewStats}
      onHelpful={handleHelpful}
    />
  )
  */
  
  return null
}
