/**
 * Complete Products API Example
 * 
 * This file demonstrates a production-ready API with:
 * - Full CRUD operations
 * - Validation
 * - Error handling
 * - Filtering and pagination
 * - TypeScript types
 * 
 * File: app/api/products/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: number;
  category_id: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface FilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional().nullable(),
  price: z.number().positive('Price must be positive'),
  inventory: z.number().int().min(0, 'Inventory cannot be negative').default(0),
  category_id: z.string().uuid('Invalid category ID'),
  image_url: z.string().url().optional().nullable(),
});

const queryParamsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  category: z.string().uuid().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  search: z.string().optional(),
  inStock: z.enum(['true', 'false']).optional(),
  sort: z.enum(['name', 'price', 'created_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ============================================================================
// Helper Functions
// ============================================================================

function parseQueryParams(searchParams: URLSearchParams) {
  const params = Object.fromEntries(searchParams.entries());
  const validated = queryParamsSchema.parse(params);

  return {
    pagination: {
      page: parseInt(validated.page),
      limit: parseInt(validated.limit),
    },
    filters: {
      category: validated.category,
      minPrice: validated.minPrice ? parseFloat(validated.minPrice) : undefined,
      maxPrice: validated.maxPrice ? parseFloat(validated.maxPrice) : undefined,
      search: validated.search,
      inStock: validated.inStock === 'true' ? true : validated.inStock === 'false' ? false : undefined,
    },
    sort: {
      field: validated.sort,
      order: validated.order,
    },
  };
}

function buildProductQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: FilterParams,
  sort: { field: string; order: string }
) {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(
        id,
        name,
        slug
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      query = query.gt('inventory', 0);
    } else {
      query = query.eq('inventory', 0);
    }
  }

  // Apply sorting
  query = query.order(sort.field, { ascending: sort.order === 'asc' });

  return query;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.issues.map((e: z.ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// ============================================================================
// GET - List Products with Filtering and Pagination
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate query parameters
    const { pagination, filters, sort } = parseQueryParams(
      request.nextUrl.searchParams
    );

    // Calculate offset for pagination
    const offset = (pagination.page - 1) * pagination.limit;

    // Build and execute query
    let query = buildProductQuery(supabase, filters, sort);
    query = query.range(offset, offset + pagination.limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      throw new ApiError(500, 'Failed to fetch products', error);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return NextResponse.json({
      products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
      filters,
      sort,
    });

  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// POST - Create New Product
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', validatedData.category_id)
      .single();

    if (categoryError || !category) {
      throw new ApiError(400, 'Invalid category ID');
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create product', error);
    }

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product
      },
      { status: 201 }
    );

  } catch (error) {
    return handleError(error);
  }
}

/**
 * Complete Single Product API Example
 * 
 * File: app/api/products/[id]/route.ts
 */

// ============================================================================
// GET - Get Single Product
// ============================================================================

export async function GET_SINGLE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Validate UUID format
    const uuidSchema = z.string().uuid();
    const productId = uuidSchema.parse(params.id);

    // Fetch product with related data
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug,
          description
        ),
        reviews(
          id,
          rating,
          title,
          body,
          created_at
        )
      `)
      .eq('id', productId)
      .single();

    if (error || !product) {
      throw new ApiError(404, 'Product not found');
    }

    // Calculate average rating
    const reviews = product.reviews || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      product: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      }
    });

  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// PUT - Replace Entire Product
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Validate UUID
    const uuidSchema = z.string().uuid();
    const productId = uuidSchema.parse(params.id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if product exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (!existing) {
      throw new ApiError(404, 'Product not found');
    }

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update product', error);
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// PATCH - Update Partial Product
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Validate UUID
    const uuidSchema = z.string().uuid();
    const productId = uuidSchema.parse(params.id);

    // Parse and validate request body (partial)
    const body = await request.json();
    const partialSchema = productSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Check if product exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (!existing) {
      throw new ApiError(404, 'Product not found');
    }

    // Update only provided fields
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to update product', error);
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// DELETE - Remove Product
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Validate UUID
    const uuidSchema = z.string().uuid();
    const productId = uuidSchema.parse(params.id);

    // Check if product exists
    const { data: existing } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (!existing) {
      throw new ApiError(404, 'Product not found');
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw new ApiError(500, 'Failed to delete product', error);
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
      deletedProduct: existing
    });

  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

/*

// GET - List products with filters
fetch('/api/products?page=1&limit=10&category=abc-123&minPrice=10&maxPrice=50&search=ramen&inStock=true&sort=price&order=asc')

// POST - Create product
fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Tonkotsu Ramen',
    description: 'Rich pork bone broth',
    price: 12.99,
    inventory: 50,
    category_id: 'abc-123',
    image_url: 'https://example.com/image.jpg'
  })
})

// GET - Single product
fetch('/api/products/abc-123')

// PUT - Replace product
fetch('/api/products/abc-123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Tonkotsu Ramen',
    description: 'Updated description',
    price: 14.99,
    inventory: 30,
    category_id: 'abc-123',
    image_url: 'https://example.com/new-image.jpg'
  })
})

// PATCH - Update price only
fetch('/api/products/abc-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    price: 15.99
  })
})

// DELETE - Remove product
fetch('/api/products/abc-123', {
  method: 'DELETE'
})

*/
