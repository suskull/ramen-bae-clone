import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Review, ReviewStats } from '@/lib/supabase/types'

// Fetch reviews for a product
export function useProductReviews(productId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as Review[]
    },
  })
}

// Fetch review stats for a product
export function useProductReviewStats(productId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['review-stats', productId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)

      if (error) {
        throw new Error(error.message)
      }

      // Calculate stats
      const totalReviews = reviews.length
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      }

      return {
        averageRating,
        totalReviews,
        ratingDistribution,
      } as ReviewStats
    },
  })
}

// Mark review as helpful
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data, error } = await supabase
        .from('reviews')
        .select('helpful')
        .eq('id', reviewId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const newHelpfulCount = (data.helpful || 0) + 1

      const { error: updateError } = await supabase
        .from('reviews')
        .update({ helpful: newHelpfulCount })
        .eq('id', reviewId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return { reviewId, helpful: newHelpfulCount }
    },
    onSuccess: (data) => {
      // Invalidate reviews query to refetch
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
