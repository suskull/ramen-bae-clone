'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Review, ReviewStats } from '@/lib/supabase/types'
import { ReviewCard } from './ReviewCard'
import { Button } from '@/components/ui/button'
import { ReviewCardSkeleton } from '@/components/ui'

interface ReviewListProps {
  reviews: Review[]
  reviewStats: ReviewStats
  onHelpful?: (reviewId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export function ReviewList({
  reviews,
  reviewStats,
  onHelpful,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: ReviewListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 10
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const paginatedReviews = reviews.slice(startIndex, endIndex)
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      // Scroll to top of reviews
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (hasMore && onLoadMore) {
      onLoadMore()
    }
  }
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="border-b border-gray-200 pb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {reviewStats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.round(reviewStats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">
              Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Rating Histogram */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]
              const percentage = reviewStats.totalReviews > 0 
                ? (count / reviewStats.totalReviews) * 100 
                : 0
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700">
                      {rating}
                    </span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div>
        <h4 className="text-xl font-semibold text-gray-900 mb-6">
          Reviews ({reviewStats.totalReviews})
        </h4>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No reviews yet</p>
            <p className="text-sm text-gray-500">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {paginatedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onHelpful={onHelpful}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {(totalPages > 1 || hasMore) && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, reviews.length)} of {reviews.length} reviews
                  {hasMore && ' (more available)'}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={(!hasMore && currentPage === totalPages) || isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Next'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
