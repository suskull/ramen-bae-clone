'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus, ShoppingCart, Check, Leaf, Award, Shield, Sparkles, Info } from 'lucide-react'
import { ProductCarousel } from './ProductCarousel'
import { NutritionFactsModal } from './NutritionFactsModal'
import { Button } from '@/components/ui/button'
import { Product, ProductImage, NutritionFacts } from '@/lib/supabase/types'
import { cn, formatCurrency } from '@/lib/utils'

interface ProductDetailLayoutProps {
  product: Product
}

export function ProductDetailLayout({ product }: ProductDetailLayoutProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false)

  // Parse images from JSON
  const images = (product.images as unknown as ProductImage[]) || []
  
  // Parse nutrition facts from JSON
  const nutritionFacts = product.nutrition_facts as unknown as NutritionFacts | null
  
  // Check if product is sold out
  const isSoldOut = product.inventory <= 0
  
  // Format prices
  const formattedPrice = formatCurrency(product.price)
  const formattedComparePrice = product.compare_at_price 
    ? formatCurrency(product.compare_at_price)
    : null

  // Calculate per-serving price (assuming 10 servings per product)
  const servingsPerProduct = 10
  const pricePerServing = product.price / servingsPerProduct
  const formattedPricePerServing = formatCurrency(pricePerServing * quantity)

  // Calculate total price
  const totalPrice = product.price * quantity
  const formattedTotalPrice = formatCurrency(totalPrice)

  // Product features with icons
  const featureIcons = {
    'Whole Ingredients': Leaf,
    'Small Batch': Award,
    'Low Fat': Shield,
    'Non-GMO': Sparkles,
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.inventory) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    // Simulate adding to cart (will be implemented in cart functionality task)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setIsAddingToCart(false)
    setAddedToCart(true)
    
    // Reset added state after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/products"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </nav>

        {/* Product Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Images */}
          <div>
            <ProductCarousel 
              images={images}
              productName={product.name}
              accentColor={product.accent_color}
            />
          </div>

          {/* Right Column - Product Info */}
          <div>
            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span 
                  className="text-4xl font-bold"
                  style={{ color: product.accent_color }}
                >
                  {formattedPrice}
                </span>
                {formattedComparePrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formattedComparePrice}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {formattedPricePerServing} per serving ({quantity} {quantity === 1 ? 'pack' : 'packs'})
              </p>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Product Features
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((feature, index) => {
                    const Icon = featureIcons[feature as keyof typeof featureIcons] || Check
                    return (
                      <div 
                        key={index}
                        className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <Icon 
                          className="w-5 h-5 shrink-0"
                          style={{ color: product.accent_color }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nutrition Facts Button */}
            {(nutritionFacts || product.ingredients.length > 0 || product.allergens.length > 0) && (
              <div className="mb-6">
                <button
                  onClick={() => setIsNutritionModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: product.accent_color }}
                >
                  <Info 
                    className="w-5 h-5"
                    style={{ color: product.accent_color }}
                  />
                  <span 
                    className="font-semibold"
                    style={{ color: product.accent_color }}
                  >
                    View Nutrition Facts & Ingredients
                  </span>
                </button>
              </div>
            )}

            {/* Inventory Status */}
            {!isSoldOut && product.inventory <= 10 && (
              <div className="mb-6">
                <p className="text-sm text-orange-600 font-medium">
                  Only {product.inventory} left in stock!
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isSoldOut}
                    className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-gray-900 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.inventory || isSoldOut}
                    className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.inventory} available
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={isSoldOut || isAddingToCart}
                className={cn(
                  "w-full h-14 text-lg font-semibold transition-all",
                  addedToCart && "bg-green-600 hover:bg-green-600"
                )}
                style={
                  !addedToCart && !isSoldOut
                    ? { backgroundColor: product.accent_color }
                    : undefined
                }
              >
                {isSoldOut ? (
                  'Sold Out'
                ) : isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - {formattedTotalPrice}
                  </>
                )}
              </Button>
            </div>

            {/* Additional Product Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Ingredients
                  </h3>
                  <p className="text-sm text-gray-700">
                    {product.ingredients.join(', ')}
                  </p>
                </div>
              )}

              {/* Allergens */}
              {product.allergens && product.allergens.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Allergens
                  </h3>
                  <p className="text-sm text-gray-700">
                    {product.allergens.join(', ')}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Facts Modal */}
      <NutritionFactsModal
        isOpen={isNutritionModalOpen}
        onClose={() => setIsNutritionModalOpen(false)}
        nutritionFacts={nutritionFacts}
        ingredients={product.ingredients}
        allergens={product.allergens}
        productName={product.name}
        accentColor={product.accent_color}
      />
    </div>
  )
}
