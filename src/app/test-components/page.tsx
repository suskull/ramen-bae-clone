import { ProductCard } from '@/components/product'
import { Product, ReviewStats } from '@/lib/supabase/types'

// Mock product data for testing
const mockProduct: Product & { reviewStats: ReviewStats } = {
  id: '1',
  slug: 'ultimate-ramen-mix',
  name: 'Ultimate Ramen Mix',
  description: 'The perfect combination of all our best toppings in one convenient package.',
  price: 24.99,
  compare_at_price: 29.99,
  images: [
    {
      url: 'https://via.placeholder.com/400x400/fe90b8/ffffff?text=Ultimate+Mix',
      alt: 'Ultimate Ramen Mix package',
      type: 'main'
    },
    {
      url: 'https://via.placeholder.com/400x400/F999BF/ffffff?text=Mix+Contents', 
      alt: 'Ultimate Ramen Mix contents',
      type: 'hover'
    }
  ],
  category_id: '1',
  tags: ['bestseller', 'value-pack'],
  inventory: 150,
  nutrition_facts: null,
  ingredients: ['Dried Green Onions', 'Sesame Seeds', 'Nori Seaweed'],
  allergens: ['Sesame', 'Seaweed'],
  features: ['Whole Ingredients', 'Small Batch', 'Low Fat', 'Non-GMO'],
  accent_color: '#fe90b8',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  reviewStats: {
    averageRating: 4.7,
    totalReviews: 23,
    ratingDistribution: {
      5: 18,
      4: 3,
      3: 1,
      2: 1,
      1: 0
    }
  }
}

const soldOutProduct: Product & { reviewStats: ReviewStats } = {
  ...mockProduct,
  id: '2',
  slug: 'sold-out-product',
  name: 'Sold Out Product',
  inventory: 0,
  accent_color: '#ff4100',
  reviewStats: {
    averageRating: 4.2,
    totalReviews: 8,
    ratingDistribution: {
      5: 4,
      4: 2,
      3: 1,
      2: 1,
      1: 0
    }
  }
}

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ProductCard Component Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Regular Product</h2>
          <ProductCard product={mockProduct} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Sold Out Product</h2>
          <ProductCard product={soldOutProduct} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">No Reviews Product</h2>
          <ProductCard product={{
            ...mockProduct,
            id: '3',
            slug: 'no-reviews-product',
            name: 'No Reviews Product',
            accent_color: '#96da2f',
            reviewStats: {
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0
              }
            }
          }} />
        </div>
      </div>
    </div>
  )
}