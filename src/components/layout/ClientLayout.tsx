'use client'

import { useState, useEffect } from 'react'
import { Header } from './header'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { useCartStore } from '@/stores/cart-store'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Get cart state from store
  const { itemCount, isOpen, openCart, closeCart } = useCartStore()

  // Prevent body scroll when mobile menu or cart is open
  useEffect(() => {
    if (isMobileMenuOpen || isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen, isOpen])

  return (
    <>
      <Header
        cartItemCount={itemCount}
        onCartClick={openCart}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Main content with padding for fixed header */}
      <div className="pt-16 lg:pt-20">
        {children}
      </div>

      <CartSidebar />
    </>
  )
}
