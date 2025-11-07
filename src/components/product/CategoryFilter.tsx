'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@/lib/supabase/types'

interface CategoryFilterProps {
  categories: Category[]
  className?: string
}

export function CategoryFilter({ categories, className = '' }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Update active category from URL params
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    setActiveCategory(category)
  }, [searchParams])

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug)
    
    // Update URL with category parameter
    const params = new URLSearchParams(searchParams.toString())
    if (categorySlug === 'all') {
      params.delete('category')
    } else {
      params.set('category', categorySlug)
    }
    
    // Navigate to products page with category filter
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* All Products Tab */}
      <button
        onClick={() => handleCategoryChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          activeCategory === 'all'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Products
      </button>
      
      {/* Category Tabs */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeCategory === category.slug
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.icon && (
            <span className="text-base">{category.icon}</span>
          )}
          {category.name}
        </button>
      ))}
    </div>
  )
}