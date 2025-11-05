"use client"

import * as React from "react"
import { X, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Navigation } from "./navigation"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const menuVariants = {
    hidden: { 
      x: "-100%",
      transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] as const }
    },
    visible: { 
      x: 0,
      transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] as const }
    },
    exit: { 
      x: "-100%",
      transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] as const }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.2,
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background border-r border-border z-50 lg:hidden"
          >
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="text-xl font-bold text-primary">
                  Ramen Bae
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 px-6 py-8">
                <Navigation 
                  isMobile={true} 
                  onItemClick={onClose}
                />
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onClose}
                >
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}