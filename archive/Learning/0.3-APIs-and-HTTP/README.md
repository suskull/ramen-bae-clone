# Module 3: APIs and HTTP

Learn how to build APIs - think of them as function calls over the internet!

## What You'll Learn

- What APIs are and why we need them
- HTTP methods and status codes
- REST API design principles
- Building API endpoints in Next.js
- Error handling and validation
- Connecting frontend to backend

## Quick Start

1. Make sure you have the Ramen Bae project set up
2. Work through the exercises in order
3. Each exercise builds on the previous one
4. Test your APIs using the browser or Postman

## Structure

- `exercises/` - Hands-on coding exercises
- `theory/` - Conceptual explanations and guides
- `examples/` - Reference implementations
- `QUICK-START.md` - Get started immediately
- `api-reference.md` - Quick reference for HTTP and REST

## Prerequisites

- Completed Module 2 (Database Basics)
- Basic understanding of JavaScript/TypeScript
- Familiarity with async/await
- Next.js project setup

## Learning Path

1. **Exercise 01**: Understanding APIs (theory + simple examples)
2. **Exercise 02**: Building your first GET endpoint
3. **Exercise 03**: POST, PUT, DELETE endpoints
4. **Exercise 04**: Dynamic routes and query parameters
5. **Exercise 05**: Error handling and validation
6. **Exercise 06**: Real-world API - Product Reviews

## Testing Your APIs

### Using the Browser
```javascript
// Open browser console and try:
const response = await fetch('/api/products');
const data = await response.json();
console.log(data);
```

### Using curl
```bash
# GET request
curl http://localhost:3000/api/products

# POST request
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":19.99}'
```

## Common Issues

**Port already in use**: Kill the process or use a different port
```bash
lsof -ti:3000 | xargs kill -9
```

**CORS errors**: Make sure you're calling from the same origin or configure CORS

**404 on API routes**: Check your file structure matches the URL path

## Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [HTTP Status Codes](https://httpstatuses.com/)
- [REST API Best Practices](https://restfulapi.net/)

## Next Steps

After completing this module, you'll be ready for Module 4: Authentication and Authorization!
