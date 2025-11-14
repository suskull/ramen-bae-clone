/**
 * ReviewForm Component Usage Example
 * 
 * This file demonstrates how to integrate the ReviewForm component
 * into a product detail page or modal.
 */

'use client'

import { useState } from 'react'
import { ReviewForm } from './ReviewForm'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'

export function ReviewFormExample() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const productId = 'example-product-id'
  
  const handleReviewSuccess = () => {
    setIsModalOpen(false)
    // Optionally refresh reviews list or show success message
  }
  
  return (
    <div>
      {/* Trigger Button */}
      <Button 
        variant="primary" 
        onClick={() => setIsModalOpen(true)}
      >
        Write a Review
      </Button>
      
      {/* Modal with ReviewForm */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Write a Review</ModalTitle>
          </ModalHeader>
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  )
}

/**
 * Alternative: Inline Form (without modal)
 */
export function InlineReviewFormExample() {
  const productId = 'example-product-id'
  
  const handleReviewSuccess = () => {
    console.log('Review submitted successfully!')
    // Optionally refresh reviews list or show success message
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <ReviewForm
        productId={productId}
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}
