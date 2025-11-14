'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItem } from './CartItem'
import { ProgressBar } from './ProgressBar'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function CartSidebar() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    subtotal, 
    gifts,
    itemCount 
  } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[480px] sm:max-w-[480px] flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-6 border-b border-gray-200">
          <SheetTitle className="text-2xl font-bold text-gray-900 text-left">
            Your Cart
            {itemCount > 0 && (
              <span className="ml-2 text-lg font-normal text-gray-600">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <>
              {/* Progress Bar */}
              <div className="px-6">
                <ProgressBar subtotal={subtotal} gifts={gifts} />
              </div>

              {/* Cart Items */}
              <div className="px-6 py-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer with Subtotal and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">
                Subtotal
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Shipping Note */}
            <p className="text-sm text-gray-600 mb-4 text-center">
              Shipping and taxes calculated at checkout
            </p>

            {/* Checkout Button */}
            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6 text-lg rounded-lg transition-colors"
              onClick={() => {
                // TODO: Navigate to checkout
                console.log('Navigate to checkout')
              }}
            >
              Proceed to Checkout
            </Button>

            {/* Continue Shopping Link */}
            <button
              onClick={closeCart}
              className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Empty Cart Component with Product Recommendations
function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      {/* Empty Cart Icon */}
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <ShoppingBag className="w-12 h-12 text-gray-400" />
      </div>

      {/* Empty Cart Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-600 text-center mb-8 max-w-sm">
        Looks like you haven't added any ramen toppings yet. Start shopping to enhance your noods!
      </p>

      {/* Shop Now Button */}
      <Button
        onClick={onClose}
        className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-6 text-lg rounded-lg transition-colors"
      >
        Start Shopping
      </Button>

      {/* Product Recommendations Section */}
      <div className="mt-12 w-full">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Popular Picks
        </h4>
        <div className="space-y-4">
          <RecommendationCard
            name="Ultimate Ramen Mix"
            price={12.99}
            image="/products/ultimate-ramen-mix-1.svg"
            slug="ultimate-ramen-mix"
          />
          <RecommendationCard
            name="Spicy Garlic Mix"
            price={10.99}
            image="/products/spicy-garlic-mix-1.svg"
            slug="spicy-garlic-mix"
          />
          <RecommendationCard
            name="Nori Sheets"
            price={6.99}
            image="/products/nori-sheets-1.svg"
            slug="nori-sheets"
          />
        </div>
      </div>
    </div>
  )
}

// Simple Recommendation Card Component
function RecommendationCard({
  name,
  price,
  image,
  slug,
}: {
  name: string
  price: number
  image: string
  slug: string
}) {
  return (
    <a
      href={`/products/${slug}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h5>
        <p className="text-sm font-semibold text-primary">
          {formatCurrency(price)}
        </p>
      </div>
    </a>
  )
}
