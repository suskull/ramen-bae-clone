'use client'

import { useState, useRef } from 'react'
import { Star, Upload, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userName, setUserName] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  
  // Check authentication on mount
  useState(() => {
    checkAuth()
  })
  
  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    if (user) {
      // Get user name from profile or email
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
      
      setUserName(profile?.name || user.email?.split('@')[0] || 'Anonymous')
    }
  }

  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Limit to 5 files total
    if (mediaFiles.length + files.length > 5) {
      setError('You can upload a maximum of 5 media files')
      return
    }
    
    const newMediaFiles: MediaFile[] = []
    
    files.forEach((file) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      // Check file type
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        setError('Only image and video files are allowed')
        return
      }
      
      // Create preview URL
      const preview = URL.createObjectURL(file)
      
      newMediaFiles.push({
        file,
        preview,
        type: isImage ? 'image' : 'video'
      })
    })
    
    setMediaFiles([...mediaFiles, ...newMediaFiles])
    setError(null)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Remove media file
  const handleRemoveMedia = (index: number) => {
    const newMediaFiles = [...mediaFiles]
    // Revoke object URL to free memory
    URL.revokeObjectURL(newMediaFiles[index].preview)
    newMediaFiles.splice(index, 1)
    setMediaFiles(newMediaFiles)
  }
  
  // Validate form
  const validateForm = (): boolean => {
    if (rating === 0) {
      setError('Please select a rating')
      return false
    }
    
    if (body.trim().length < 10) {
      setError('Review must be at least 10 characters long')
      return false
    }
    
    if (body.trim().length > 1000) {
      setError('Review must be less than 1000 characters')
      return false
    }
    
    return true
  }

  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check authentication
    if (isAuthenticated === false) {
      setError('You must be signed in to submit a review')
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be signed in to submit a review')
        setIsAuthenticated(false)
        return
      }
      
      // Upload media files if any
      const uploadedMedia: Array<{ url: string; type: 'image' | 'video'; thumbnail?: string }> = []
      
      if (mediaFiles.length > 0) {
        for (const mediaFile of mediaFiles) {
          const fileExt = mediaFile.file.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `reviews/${fileName}`
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, mediaFile.file)
          
          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error('Failed to upload media file')
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath)
          
          uploadedMedia.push({
            url: publicUrl,
            type: mediaFile.type,
            thumbnail: mediaFile.type === 'video' ? publicUrl : undefined
          })
        }
      }
      
      // Insert review into database
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          user_name: userName,
          rating,
          title: title.trim() || null,
          body: body.trim(),
          verified: false, // Will be set to true if user has purchased the product
          media: uploadedMedia,
          helpful: 0
        })
      
      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('Failed to submit review')
      }
      
      // Clean up object URLs
      mediaFiles.forEach(media => URL.revokeObjectURL(media.preview))
      
      // Reset form
      setRating(0)
      setTitle('')
      setBody('')
      setMediaFiles([])
      
      // Call success callback
      onSuccess?.()
      
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  
  // Show authentication required message
  if (isAuthenticated === false) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sign in to write a review
        </h3>
        <p className="text-gray-600 mb-6">
          You need to be signed in to submit a product review
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => {
            // TODO: Open sign-in modal
            console.log('Open sign-in modal')
          }}>
            Sign In
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Write a Review
        </h3>
        <p className="text-sm text-gray-600">
          Share your experience with this product
        </p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {/* Rating Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          )}
        </div>
      </div>

      
      {/* Review Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-900 mb-2">
          Review Title (Optional)
        </label>
        <Input
          id="review-title"
          type="text"
          placeholder="Sum up your experience in a few words"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          {title.length}/100 characters
        </p>
      </div>
      
      {/* Review Body */}
      <div>
        <label htmlFor="review-body" className="block text-sm font-medium text-gray-900 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-body"
          placeholder="Tell us what you think about this product..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={6}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {body.length}/1000 characters (minimum 10)
        </p>
      </div>
      
      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Add Photos or Videos (Optional)
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Upload up to 5 images or videos (max 10MB each)
        </p>
        
        {/* Media Preview Grid */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {mediaFiles.map((media, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {media.type === 'image' ? (
                  <Image
                    src={media.preview}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 20vw"
                  />
                ) : (
                  <video
                    src={media.preview}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(index)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Button */}
        {mediaFiles.length < 5 && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4" />
              Upload Media
            </Button>
          </div>
        )}
      </div>

      
      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || rating === 0 || body.trim().length < 10}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  )
}
