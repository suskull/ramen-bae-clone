'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { ProductWithStats } from '@/lib/api/products'

/**
 * Example mutation hooks for products
 * These show how to properly invalidate queries after mutations
 */

interface CreateProductInput {
  name: string
  price: number
  category: string
  // ... other fields
}

interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

// Mock API functions (replace with real ones)
async function createProduct(input: CreateProductInput): Promise<ProductWithStats> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('Failed to create product')
  return response.json()
}

async function updateProduct(input: UpdateProductInput): Promise<ProductWithStats> {
  const response = await fetch(`/api/products/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('Failed to update product')
  return response.json()
}

async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete product')
}

/**
 * Create product mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      // Invalidate all product lists to refetch with new product
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      
      // Optionally, you can also set the query data directly (optimistic update)
      // queryClient.setQueryData(
      //   queryKeys.products.detail(newProduct.id),
      //   newProduct
      // )
    },
  })
}

/**
 * Update product mutation with optimistic updates
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProduct,
    // Optimistic update
    onMutate: async (updatedProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.products.detail(updatedProduct.id) 
      })

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(
        queryKeys.products.detail(updatedProduct.id)
      )

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      )

      // Return context with snapshot
      return { previousProduct }
    },
    // On error, rollback
    onError: (err, updatedProduct, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          queryKeys.products.detail(updatedProduct.id),
          context.previousProduct
        )
      }
    },
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.products.detail(variables.id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.products.lists() 
      })
    },
  })
}

/**
 * Delete product mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.products.detail(deletedId) 
      })
      
      // Invalidate lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.products.lists() 
      })
    },
  })
}
