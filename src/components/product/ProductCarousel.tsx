'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductImage } from '@/lib/supabase/types'
import { getImageQuality, getImageSizes } from '@/lib/image-optimization'

interface ProductCarouselProps {
  images: ProductImage[]
  productName: string
  accentColor?: string
  className?: string
}

export function ProductCarousel({ 
  images, 
  productName, 
  accentColor = '#fe90b8',
  className 
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)

  // Filter out invalid images and ensure we have at least one
  const validImages = images.filter(img => img.url) || []
  
  if (validImages.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">No images available</span>
        </div>
      </div>
    )
  }

  const currentImage = validImages[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !imageWrapperRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Update CSS variables directly without triggering React re-render
    imageWrapperRef.current.style.setProperty('--zoom-x', `${x}%`)
    imageWrapperRef.current.style.setProperty('--zoom-y', `${y}%`)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Main Image Display */}
      <div className="relative mb-4">
        <div
          ref={imageContainerRef}
          className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in group"
          onMouseMove={handleMouseMove}
        >
          <div
            ref={imageWrapperRef}
            className="relative w-full h-full transition-transform duration-300 ease-out group-hover:scale-150"
            style={{
              transformOrigin: 'var(--zoom-x, 50%) var(--zoom-y, 50%)',
            }}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || `${productName} - Image ${currentIndex + 1}`}
              fill
              className="object-cover pointer-events-none"
              sizes={getImageSizes('PRODUCT_DETAIL')}
              priority={currentIndex === 0}
              quality={getImageQuality('PRODUCT_DETAIL')}
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
            />
          </div>

          {/* Zoom Indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none">
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </div>

          {/* Navigation Arrows - Only show if multiple images */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 ease-out opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 ease-out opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation - Only show if multiple images */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ease-out",
                currentIndex === index
                  ? "border-opacity-100 ring-2 ring-offset-2"
                  : "border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100"
              )}
              style={
                currentIndex === index
                  ? {
                      borderColor: accentColor,
                      '--tw-ring-color': accentColor,
                    } as React.CSSProperties
                  : undefined
              }
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes={getImageSizes('THUMBNAIL')}
                loading="lazy"
                quality={getImageQuality('THUMBNAIL')}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
