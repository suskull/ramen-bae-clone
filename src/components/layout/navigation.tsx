"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
]

interface NavigationProps {
  className?: string
  onItemClick?: () => void
  isMobile?: boolean
}

export function Navigation({ className, onItemClick, isMobile = false }: NavigationProps) {
  const pathname = usePathname()

  const linkVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    })
  }

  return (
    <nav className={cn("flex", isMobile ? "flex-col space-y-4" : "items-center space-x-8", className)}>
      {navigationItems.map((item, index) => {
        const isActive = pathname === item.href || 
          (item.href === "/products" && pathname.startsWith("/products"))
        
        return (
          <motion.div
            key={item.href}
            variants={isMobile ? mobileItemVariants : undefined}
            initial={isMobile ? "hidden" : undefined}
            animate={isMobile ? "visible" : undefined}
            custom={index}
            whileHover={!isMobile ? "hover" : undefined}
            whileTap={!isMobile ? "tap" : undefined}
          >
            <Link
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "relative font-medium transition-colors duration-200",
                isMobile 
                  ? "text-lg py-2 block hover:text-primary" 
                  : "text-sm hover:text-primary",
                isActive 
                  ? "text-primary" 
                  : "text-foreground"
              )}
            >
              {item.label}
              {isActive && !isMobile && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )
}