"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useCartStore } from "@/stores/cart-store"

/**
 * Component that syncs cart with authentication state
 * - Merges guest cart with user cart on login
 * - Loads user cart on mount if authenticated
 */
export function AuthCartSync() {
  const { user, loading } = useAuth()
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart)
  const loadFromSupabase = useCartStore((state) => state.loadFromSupabase)

  useEffect(() => {
    if (loading) return

    if (user) {
      // User is authenticated, merge guest cart with user cart
      mergeGuestCart(user.id)
    }
  }, [user, loading, mergeGuestCart, loadFromSupabase])

  return null
}
