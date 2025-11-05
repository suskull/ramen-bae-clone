"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, ShoppingCart, User } from "lucide-react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "./mobile-menu"
import { Navigation } from "./navigation"

interface HeaderProps {
  cartItemCount?: number
  onCartClick?: () => void
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function Header({ 
  cartItemCount = 0, 
  onCartClick, 
  onMobileMenuToggle,
  isMobileMenuOpen = false 
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50" 
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMobileMenuToggle}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 shrink-0"
            >
              <div className="text-2xl font-bold text-primary">
                Ramen Bae
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <Navigation />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Account button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Cart button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onCartClick}
                className="relative"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => onMobileMenuToggle?.()} 
      />
    </>
  )
}