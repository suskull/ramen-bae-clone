# Quick Start: APIs and HTTP

Get started with building APIs in 5 minutes!

## What You Need

- Next.js project running (`npm run dev`)
- Database set up from Module 2
- Code editor open

## Your First API Endpoint (2 minutes)

### Step 1: Create the file
Create `app/api/hello/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from your first API!' 
  });
}
```

### Step 2: Test it
Open your browser to: `http://localhost:3000/api/hello`

You should see:
```json
{
  "message": "Hello from your first API!"
}
```

🎉 **Congratulations!** You just built your first API endpoint!

## Understanding What Happened

Think of it like a function call:

**Frontend (Browser):**
```javascript
// When you visit /api/hello, it's like calling:
const result = GET();
// Browser displays the returned JSON
```

**Backend (Your API):**
```typescript
// Your function that runs on the server
export async function GET() {
  return { message: 'Hello from your first API!' };
}
```

## Next: Real Data (3 minutes)

### Step 1: Create a products API
Create `app/api/products/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);
  
  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ products });
}
```

### Step 2: Test it
Visit: `http://localhost:3000/api/products`

You should see your products from the database!

## Test in Browser Console

Open browser console (F12) and try:

```javascript
// Fetch products
const response = await fetch('/api/products');
const data = await response.json();
console.log(data);

// Check the response status
console.log(response.status); // Should be 200
```

## Common Patterns

### GET - Read Data
```typescript
export async function GET() {
  // Fetch and return data
}
```

### POST - Create Data
```typescript
export async function POST(request) {
  const body = await request.json();
  // Create new record with body data
}
```

### Status Codes
```typescript
// Success
return NextResponse.json({ data }, { status: 200 });

// Created
return NextResponse.json({ data }, { status: 201 });

// Bad Request
return NextResponse.json({ error }, { status: 400 });

// Not Found
return NextResponse.json({ error }, { status: 404 });

// Server Error
return NextResponse.json({ error }, { status: 500 });
```

## What's Next?

Now that you've built your first API, head to the exercises:

1. `exercises/01-api-basics.md` - Understand API concepts
2. `exercises/02-get-endpoints.ts` - Build GET endpoints
3. `exercises/03-crud-operations.ts` - Full CRUD API
4. `exercises/04-dynamic-routes.ts` - URL parameters
5. `exercises/05-validation.ts` - Data validation
6. `exercises/06-reviews-api.ts` - Real-world project

## Troubleshooting

**"Cannot find module '@/lib/supabase/server'"**
- Make sure you completed Module 2 setup
- Check that the file exists

**"Error: connect ECONNREFUSED"**
- Make sure your dev server is running: `npm run dev`

**"Database error"**
- Check your database is running
- Verify your .env.local has correct credentials

## Tips

- Always return JSON from API routes
- Use appropriate status codes
- Handle errors gracefully
- Test in browser console first
- Use TypeScript for better errors

Ready to dive deeper? Start with Exercise 01! 🚀
