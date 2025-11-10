'use client'

import { useCart } from '@/hooks/useCart'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { Button } from '@/components/ui/button'

export default function TestCartSidebarPage() {
  const { openCart, addToCart, items, itemCount, subtotal } = useCart()

  // Mock product data for testing
  const mockProduct = {
    id: 'test-product-1',
    slug: 'ultimate-ramen-mix',
    name: 'Ultimate Ramen Mix',
    description: 'The perfect blend of toppings for your ramen',
    price: 12.99,
    compare_at_price: null,
    images: [
      {
        url: '/products/ultimate-ramen-mix-1.svg',
        alt: 'Ultimate Ramen Mix',
        type: 'main'
      },
      {
        url: '/products/ultimate-ramen-mix-2.svg',
        alt: 'Ultimate Ramen Mix Alternate',
        type: 'hover'
      }
    ],
    category: 'mixes',
    tags: ['popular', 'bestseller'],
    inventory: 100,
    nutrition_facts: null,
    ingredients: ['Nori', 'Sesame Seeds', 'Garlic'],
    allergens: ['Sesame'],
    features: ['Whole Ingredients', 'Small Batch', 'Non-GMO'],
    accent_color: '#fe90b8',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const mockProduct2 = {
    ...mockProduct,
    id: 'test-product-2',
    slug: 'spicy-garlic-mix',
    name: 'Spicy Garlic Mix',
    price: 10.99,
    images: [
      {
        url: '/products/spicy-garlic-mix-1.svg',
        alt: 'Spicy Garlic Mix',
        type: 'main'
      }
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Cart Sidebar Test Page
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Cart Status</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Items in cart:</strong> {itemCount}
            </p>
            <p>
              <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
            </p>
            <p>
              <strong>Products:</strong>
            </p>
            <ul className="list-disc list-inside ml-4">
              {items.map((item) => (
                <li key={item.id}>
                  {item.name} - Qty: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div>
              <Button
                onClick={openCart}
                className="w-full md:w-auto"
                variant="primary"
              >
                Open Cart Sidebar
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Opens the cart sidebar to view items
              </p>
            </div>

            <div>
              <Button
                onClick={() => addToCart(mockProduct as any, 1)}
                className="w-full md:w-auto"
                variant="outline"
              >
                Add Ultimate Ramen Mix
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Adds a product to cart and opens sidebar
              </p>
            </div>

            <div>
              <Button
                onClick={() => addToCart(mockProduct2 as any, 2)}
                className="w-full md:w-auto"
                variant="outline"
              >
                Add 2x Spicy Garlic Mix
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Adds multiple quantities of a product
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Features to Test</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Slide-out sidebar animation (full-screen on mobile)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Cart items display with CartItem components</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Progress bar showing shipping/gift thresholds</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Subtotal and checkout button</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Product recommendations when cart is empty</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Backdrop overlay with click-to-close</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Escape key to close cart</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Body scroll prevention when open</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Cart Sidebar Component */}
      <CartSidebar />
    </div>
  )
}
