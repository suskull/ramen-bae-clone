"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Package, LogOut, Mail } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const [name, setName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }

    if (user) {
      setName(user.user_metadata?.name || "")
    }
  }, [user, loading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError(null)
    setUpdateSuccess(false)
    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      })

      if (error) {
        setUpdateError(error.message)
        return
      }

      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (err) {
      setUpdateError("An unexpected error occurred. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and view your orders
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.user_metadata?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <button
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                  onClick={() => {}}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                <button
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                  onClick={() => {}}
                >
                  <Package className="h-5 w-5" />
                  <span>Orders</span>
                </button>
                <button
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors text-left"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your account details
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                {updateSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                    Profile updated successfully!
                  </div>
                )}

                {updateError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {updateError}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Order History</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  View your past orders
                </p>
              </div>

              <div className="p-6">
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Link href="/products">
                    <Button variant="primary">Browse Products</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your password and security settings
                </p>
              </div>

              <div className="p-6">
                <Link href="/forgot-password">
                  <Button variant="outline">Change Password</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
