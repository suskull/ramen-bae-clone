"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=mixes", label: "Mixes" },
    { href: "/products?category=single-toppings", label: "Single Toppings" },
    { href: "/products?category=bundles", label: "Bundles" },
    { href: "/products?category=seasoning-sauce", label: "Seasoning & Sauce" },
    { href: "/products?category=merch", label: "Merch" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
    { href: "/shipping", label: "Shipping Info" },
    { href: "/returns", label: "Returns" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ]
}

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <footer className={cn("bg-gray-50 border-t border-border", className)}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="text-2xl font-bold text-primary">
                Ramen Bae
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Enhance your noods with the first ever dried ramen toppings. 
              Made with whole ingredients, small batch crafted, and loved by 300K+ customers.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>20M+ views</span>
              <span>•</span>
              <span>120K+ fans</span>
              <span>•</span>
              <span>300K+ customers</span>
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ramen Bae. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">
              Made with ❤️ for ramen lovers
            </span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}