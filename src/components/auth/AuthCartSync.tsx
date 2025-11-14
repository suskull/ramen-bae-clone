"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useCartStore } from "@/stores/cart-store"

/**
 * Component that syncs cart with authentication state
 * - Merges guest cart with user cart on login (combines quantities)
 * - Clears guest cart after merge to prevent duplicates
 * - Clears cart on logout for fresh start
 * - Loads user cart on mount if authenticated
 */
export function AuthCartSync() {
  const { user, loading } = useAuth()
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart)
  const clearCartOnLogout = useCartStore((state) => state.clearCartOnLogout)
  
  // Track previous user state to detect login/logout
  const prevUserRef = useRef<typeof user>(undefined)

  useEffect(() => {
    if (loading) return

    const prevUser = prevUserRef.current
    prevUserRef.current = user

    // User just logged in
    if (user && !prevUser) {
      // Merge guest cart with user cart (if any guest items exist)
      // This will automatically clear guest cart after merge via loadFromSupabase
      mergeGuestCart(user.id)
    }
    
    // User just logged out
    if (!user && prevUser) {
      // Clear cart on logout to prevent stale data
      clearCartOnLogout()
    }
  }, [user, loading, mergeGuestCart, clearCartOnLogout])

  return null
}
