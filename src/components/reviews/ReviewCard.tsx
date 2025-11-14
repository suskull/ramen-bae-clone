'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ThumbsUp, CheckCircle } from 'lucide-react'
import { Review, ReviewMedia } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

interface ReviewCardProps {
  review: Review
  onHelpful?: (reviewId: string) => void
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const [isHelpfulClicked, setIsHelpfulClicked] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  
  // Parse media from JSON
  const media = (review.media as unknown as ReviewMedia[]) || []
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(review.created_at), { 
    addSuffix: true 
  })
  
  // Handle helpful button click
  const handleHelpfulClick = () => {
    if (!isHelpfulClicked) {
      setIsHelpfulClicked(true)
      setHelpfulCount(prev => prev + 1)
      onHelpful?.(review.id)
    }
  }
  
  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      {/* Header: Rating, Name, Date */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          
          {/* Customer Name and Verified Badge */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {review.user_name}
            </span>
            {review.verified && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Verified Purchase</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Date */}
        <span className="text-sm text-gray-500">
          {formattedDate}
        </span>
      </div>
      
      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">
          {review.title}
        </h4>
      )}
      
      {/* Review Body */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {review.body}
      </p>
      
      {/* Customer Photos/Videos */}
      {media.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {media.map((item, index) => (
            <div 
              key={index}
              className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100"
            >
              {item.type === 'image' ? (
                <Image
                  src={item.url}
                  alt={`Review media ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes={getImageSizes('THUMBNAIL_SMALL')}
                  loading="lazy"
                  quality={getImageQuality('REVIEW_MEDIA')}
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={item.thumbnail || item.url}
                    alt={`Review video ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes={getImageSizes('THUMBNAIL_SMALL')}
                    loading="lazy"
                    quality={getImageQuality('REVIEW_MEDIA')}
                  />
                  {/* Video play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <div className="w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Helpful Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpfulClick}
          disabled={isHelpfulClicked}
          className={`text-gray-600 hover:text-gray-900 ${
            isHelpfulClicked ? 'text-primary' : ''
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpfulClicked ? 'fill-current' : ''}`} />
          Helpful ({helpfulCount})
        </Button>
      </div>
    </div>
  )
}
