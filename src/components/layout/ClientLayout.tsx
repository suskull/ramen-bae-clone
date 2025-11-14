'use client'

import { CartSidebar } from '@/components/cart/CartSidebar'
import { useCart } from '@/hooks/useCart'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthCartSync } from '../auth'
import { Header } from './header'
import { Footer } from './footer'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Get cart state from hook
  const { itemCount, isOpen, openCart } = useCart()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
      <AuthCartSync />
      
      <Header
        cartItemCount={itemCount}
        onCartClick={openCart}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Main content with padding for fixed header */}
      <div className="pt-16 lg:pt-20 min-h-screen">
        {children}
      </div>

      <Footer />

      <CartSidebar />
    </>
  )
}
