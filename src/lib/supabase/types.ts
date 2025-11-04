export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          price: number
          compare_at_price: number | null
          images: Json
          category_id: string | null
          tags: string[]
          inventory: number
          nutrition_facts: Json | null
          ingredients: string[]
          allergens: string[]
          features: string[]
          accent_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          images?: Json
          category_id?: string | null
          tags?: string[]
          inventory?: number
          nutrition_facts?: Json | null
          ingredients?: string[]
          allergens?: string[]
          features?: string[]
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          images?: Json
          category_id?: string | null
          tags?: string[]
          inventory?: number
          nutrition_facts?: Json | null
          ingredients?: string[]
          allergens?: string[]
          features?: string[]
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          user_name: string
          rating: number
          title: string | null
          body: string
          verified: boolean
          media: Json
          helpful: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          user_name: string
          rating: number
          title?: string | null
          body: string
          verified?: boolean
          media?: Json
          helpful?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          user_name?: string
          rating?: number
          title?: string | null
          body?: string
          verified?: boolean
          media?: Json
          helpful?: number
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for working with the database
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Cart = Database['public']['Tables']['carts']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']

// Product image type
export interface ProductImage {
  url: string
  alt: string
  type: 'main' | 'hover' | 'gallery'
}

// Nutrition facts type
export interface NutritionFacts {
  servings: number
  calories: number
  protein: string
  carbs: string
  fat: string
  sodium: string
}

// Review media type
export interface ReviewMedia {
  url: string
  type: 'image' | 'video'
  thumbnail?: string
}

// Extended product type with relations
export interface ProductWithCategory extends Product {
  category: Category | null
}

// Review stats type
export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}
