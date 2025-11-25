# Exercise 01: Query Builder Mastery

Master the Supabase query builder for complex database operations.

## Learning Objectives

- Master select queries with filtering
- Understand joins and relationships
- Implement pagination and sorting
- Use advanced query patterns
- Optimize query performance

## Part 1: Basic Queries (15 minutes)

### Task 1.1: Simple Select

```typescript
// Get all products
const { data: products, error } = await supabase
  .from('products')
  .select('*');

// Get specific columns
const { data } = await supabase
  .from('products')
  .select('id, name, price, inventory');

// Get with count
const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' });

console.log(`Found ${count} products`);
```

### Task 1.2: Filtering

```typescript
// Single filter
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId);

// Multiple filters (AND)
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
  .gte('price', 10)
  .lte('price', 50);

// OR filters
const { data } = await supabase
  .from('products')
  .select('*')
  .or('price.lt.10,price.gt.100');

// Text search
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', `%${searchTerm}%`);
```

## Part 2: Joins and Relationships (20 minutes)

### Task 2.1: One-to-One Relationship

```typescript
// Product with category
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(
      id,
      name,
      slug
    )
  `);

// Result structure:
// {
//   id: '123',
//   name: 'Spicy Ramen',
//   category: {
//     id: 'cat-1',
//     name: 'Mixes',
//     slug: 'mixes'
//   }
// }
```

### Task 2.2: One-to-Many Relationship

```typescript
// Product with reviews
const { data } = await supabase
  .from('products')
  .select(`
    *,
    reviews(
      id,
      rating,
      body,
      created_at
    )
  `);

// Result structure:
// {
//   id: '123',
//   name: 'Spicy Ramen',
//   reviews: [
//     { id: 'r1', rating: 5, body: 'Great!' },
//     { id: 'r2', rating: 4, body: 'Good' }
//   ]
// }
```

### Task 2.3: Nested Relationships

```typescript
// Product with category and reviews with user info
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(name, slug),
    reviews(
      rating,
      body,
      created_at,
      user:profiles(name, avatar_url)
    )
  `);
```

### Task 2.4: Filter on Relationships

```typescript
// Products with high-rated reviews only
const { data } = await supabase
  .from('products')
  .select(`
    *,
    reviews!inner(rating)
  `)
  .gte('reviews.rating', 4);
```

## Part 3: Pagination and Sorting (15 minutes)

### Task 3.1: Basic Pagination

```typescript
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

const totalPages = Math.ceil(count / limit);
const hasNext = page < totalPages;
const hasPrev = page > 1;
```

### Task 3.2: Sorting

```typescript
// Single sort
const { data } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false });

// Multiple sorts
const { data } = await supabase
  .from('products')
  .select('*')
  .order('category_id')
  .order('price', { ascending: false });

// Sort by foreign key
const { data } = await supabase
  .from('products')
  .select('*, category:categories(name)')
  .order('category.name');
```

### Task 3.3: Complete Pagination Component

```typescript
async function getProducts(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const { data: products, count, error } = await supabase
    .from('products')
    .select('*, category:categories(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    products,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNext: page < Math.ceil(count / limit),
      hasPrev: page > 1,
    },
  };
}
```

## Part 4: Advanced Patterns (20 minutes)

### Task 4.1: Search with Multiple Fields

```typescript
async function searchProducts(query: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  return data;
}
```

### Task 4.2: Complex Filtering

```typescript
async function getFilteredProducts(filters: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}) {
  let query = supabase.from('products').select('*');

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.inStock) {
    query = query.gt('inventory', 0);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data, error };
}
```

### Task 4.3: Aggregation with Count

```typescript
// Count by category
async function getProductCountByCategory() {
  const { data } = await supabase
    .from('products')
    .select('category_id, category:categories(name)');

  // Group by category
  const counts = data.reduce((acc, product) => {
    const categoryName = product.category.name;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return counts;
}
```

### Task 4.4: Conditional Queries

```typescript
async function getProducts(options: {
  featured?: boolean;
  sortBy?: 'price' | 'name' | 'created_at';
  order?: 'asc' | 'desc';
}) {
  let query = supabase.from('products').select('*');

  if (options.featured) {
    query = query.eq('featured', true);
  }

  const sortBy = options.sortBy || 'created_at';
  const order = options.order || 'desc';
  query = query.order(sortBy, { ascending: order === 'asc' });

  return await query;
}
```

## Challenges

### Challenge 1: Product Search
Build a comprehensive product search with filters, sorting, and pagination.

### Challenge 2: Related Products
Get related products based on category and price range.

### Challenge 3: Top Rated Products
Get products with average rating above 4 stars.

### Challenge 4: Low Stock Alert
Get products with inventory below threshold.

### Challenge 5: Recent Orders
Get user's recent orders with product details.

## Key Takeaways

- Supabase query builder is chainable
- Use select() to specify columns
- Joins are done with nested select
- Always handle errors
- Use pagination for large datasets
- Filter on server, not client

## Next Exercise

Continue to Exercise 02 for Row Level Security!
