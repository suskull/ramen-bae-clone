'use client'

import { ProductCarousel } from '@/components/product/ProductCarousel'
import { ProductImage } from '@/lib/supabase/types'

export default function TestCarouselPage() {
  // Sample product images for testing
  const sampleImages: ProductImage[] = [
    {
      url: 'https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/ultimate-ramen-mix-1.svg',
      alt: 'Ultimate Ramen Mix - Front View',
      type: 'main'
    },
    {
      url: 'https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/ultimate-ramen-mix-2.svg',
      alt: 'Ultimate Ramen Mix - Back View',
      type: 'hover'
    },
    {
      url: 'https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/spicy-mix-1.svg',
      alt: 'Spicy Mix - Front View',
      type: 'gallery'
    },
    {
      url: 'https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/spicy-mix-2.svg',
      alt: 'Spicy Mix - Back View',
      type: 'gallery'
    }
  ]

  const singleImage: ProductImage[] = [
    {
      url: 'https://nfydvfhrepavcyclzfrh.supabase.co/storage/v1/object/public/product-images/products/nori-sheets-1.svg',
      alt: 'Nori Sheets',
      type: 'main'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Product Carousel Component Test
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Multiple Images Test */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Multiple Images (with thumbnails)
            </h2>
            <ProductCarousel
              images={sampleImages}
              productName="Ultimate Ramen Mix"
              accentColor="#fe90b8"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Features demonstrated:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Image carousel with navigation arrows</li>
                <li>Thumbnail navigation below main image</li>
                <li>Hover to zoom functionality</li>
                <li>Image counter overlay</li>
                <li>Accent color highlighting on active thumbnail</li>
              </ul>
            </div>
          </div>

          {/* Single Image Test */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Single Image (no thumbnails)
            </h2>
            <ProductCarousel
              images={singleImage}
              productName="Nori Sheets"
              accentColor="#96da2f"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Features demonstrated:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Single image display</li>
                <li>No navigation arrows (only one image)</li>
                <li>No thumbnails (only one image)</li>
                <li>Hover to zoom still works</li>
                <li>Zoom indicator appears on hover</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Usage Instructions
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium mb-2">How to use:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Hover over main image</strong> to zoom in (2x magnification)</li>
                <li><strong>Move mouse</strong> while hovering to pan around the zoomed image</li>
                <li><strong>Click thumbnails</strong> to switch between images</li>
                <li><strong>Click arrow buttons</strong> to navigate through images</li>
                <li><strong>Keyboard navigation</strong> support for accessibility</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Component Props:</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
{`<ProductCarousel
  images={ProductImage[]}      // Array of product images
  productName={string}          // Product name for alt text
  accentColor={string}          // Optional: Hex color for highlights
  className={string}            // Optional: Additional CSS classes
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
