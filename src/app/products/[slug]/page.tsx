'use client'

import { useParams } from 'next/navigation'
import { ProductDetailLayout } from '@/components/product/ProductDetailLayout'
import { useProduct } from '@/hooks/useProducts'
import { ProductDetailSkeleton, PageLoader } from '@/components/ui'
import { NotFoundError, ErrorState } from '@/components/error'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: product, isLoading, error } = useProduct(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <NotFoundError
          title="Product Not Found"
          message={error instanceof Error ? error.message : 'The product you are looking for does not exist.'}
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <NotFoundError
          title="Product Not Found"
          message="The product you are looking for does not exist."
        />
      </div>
    )
  }

  return <ProductDetailLayout product={product} />
}
