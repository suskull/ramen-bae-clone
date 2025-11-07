'use client'

import { useParams } from 'next/navigation'
import { ProductDetailLayout } from '@/components/product/ProductDetailLayout'
import { useProduct } from '@/hooks/useProducts'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: product, isLoading, error } = useProduct(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Product Not Found
            </h3>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'The product you are looking for does not exist.'}
            </p>
            <a
              href="/products"
              className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Products
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Product Not Found
          </h3>
          <a
            href="/products"
            className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
    )
  }

  return <ProductDetailLayout product={product} />
}
