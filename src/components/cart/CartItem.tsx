'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import { CartItem as CartItemType } from '@/stores/cart-store'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDecrement = async () => {
    if (item.quantity <= 1) return
    setIsUpdating(true)
    updateQuantity(item.productId, item.quantity - 1)
    setTimeout(() => setIsUpdating(false), 200)
  }

  const handleIncrement = async () => {
    setIsUpdating(true)
    updateQuantity(item.productId, item.quantity + 1)
    setTimeout(() => setIsUpdating(false), 200)
  }

  const handleRemove = () => {
    removeItem(item.productId)
  }

  const itemTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <Link 
        href={`/products/${item.slug}`}
        className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-50 hover:opacity-80 transition-opacity"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        {/* Product Name */}
        <Link 
          href={`/products/${item.slug}`}
          className="block"
        >
          <h3 className="font-semibold text-sm text-gray-900 hover:text-primary transition-colors line-clamp-2">
            {item.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-sm text-gray-600 mt-1">
          {formatCurrency(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isUpdating}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            
            <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-8 text-center">
              {item.quantity}
            </span>
            
            <button
              onClick={handleIncrement}
              disabled={isUpdating}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Item Total */}
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(itemTotal)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="shrink-0 p-1 hover:bg-gray-100 rounded-md transition-colors self-start"
        aria-label="Remove item"
      >
        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  )
}
