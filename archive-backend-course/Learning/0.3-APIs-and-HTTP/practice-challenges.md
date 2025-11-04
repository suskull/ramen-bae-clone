# Practice Challenges: APIs and HTTP

Test your understanding with these real-world challenges!

## Beginner Challenges

### Challenge 1: Time API
Create an API that returns current time in different formats.

**Requirements**:
- GET `/api/time`
- Return ISO, Unix timestamp, and human-readable format
- Accept `timezone` query parameter
- Default to UTC

**Example response**:
```json
{
  "iso": "2024-01-15T10:30:00.000Z",
  "unix": 1705318200,
  "readable": "January 15, 2024 10:30 AM",
  "timezone": "UTC"
}
```

### Challenge 2: Random Quote API
Create an API that returns random quotes.

**Requirements**:
- GET `/api/quotes/random`
- Return random quote from hardcoded array
- Include author and category
- Accept `category` filter parameter

**Example response**:
```json
{
  "quote": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "category": "motivation"
}
```

### Challenge 3: URL Shortener (Mock)
Create a mock URL shortener API.

**Requirements**:
- POST `/api/shorten` - Create short URL
- GET `/api/short/[code]` - Get original URL
- Store in memory (array/object)
- Generate random 6-character code

## Intermediate Challenges

### Challenge 4: Product Search API
Enhance the products API with advanced search.

**Requirements**:
- Full-text search across name and description
- Filter by multiple categories (comma-separated)
- Sort by relevance, price, or date
- Include search highlights

**Example**:
```
GET /api/products/search?q=spicy+ramen&categories=mixes,bowls&sort=relevance
```

### Challenge 5: Reviews API
Create a complete reviews system.

**Requirements**:
- GET `/api/products/[id]/reviews` - List reviews
- POST `/api/products/[id]/reviews` - Create review
- PATCH `/api/reviews/[id]` - Update review
- DELETE `/api/reviews/[id]` - Delete review
- Include pagination and sorting
- Calculate average rating

### Challenge 6: Cart API
Build a shopping cart API.

**Requirements**:
- POST `/api/cart/add` - Add item to cart
- GET `/api/cart` - Get cart contents
- PATCH `/api/cart/[itemId]` - Update quantity
- DELETE `/api/cart/[itemId]` - Remove item
- GET `/api/cart/total` - Calculate total
- Store in database or session

## Advanced Challenges

### Challenge 7: Order Management API
Create a complete order system.

**Requirements**:
- POST `/api/orders` - Create order from cart
- GET `/api/orders` - List user's orders
- GET `/api/orders/[id]` - Get order details
- PATCH `/api/orders/[id]/status` - Update order status
- Include order items, totals, and shipping info
- Validate inventory before creating order

### Challenge 8: Analytics API
Build an analytics endpoint for products.

**Requirements**:
- GET `/api/analytics/products/popular` - Most viewed/sold
- GET `/api/analytics/products/trending` - Trending products
- GET `/api/analytics/revenue` - Revenue by period
- Accept date range parameters
- Return aggregated data with charts-ready format

### Challenge 9: Batch Operations API
Create an API for bulk operations.

**Requirements**:
- POST `/api/products/batch` - Create multiple products
- PATCH `/api/products/batch` - Update multiple products
- DELETE `/api/products/batch` - Delete multiple products
- Validate all items before processing
- Return success/failure for each item
- Use database transactions

## Expert Challenges

### Challenge 10: GraphQL-style API
Create a flexible API that lets clients specify fields.

**Requirements**:
- POST `/api/query`
- Accept `fields` parameter to specify what to return
- Support nested relationships
- Optimize database queries based on requested fields

**Example request**:
```json
{
  "resource": "products",
  "fields": ["id", "name", "price", "category.name"],
  "filters": { "minPrice": 10 },
  "limit": 10
}
```

### Challenge 11: Real-time Notifications API
Build a notification system.

**Requirements**:
- POST `/api/notifications` - Create notification
- GET `/api/notifications` - List user notifications
- PATCH `/api/notifications/[id]/read` - Mark as read
- DELETE `/api/notifications/[id]` - Delete notification
- Support different notification types
- Include unread count endpoint

### Challenge 12: API Rate Limiting
Implement rate limiting for your APIs.

**Requirements**:
- Limit requests per user/IP
- Return 429 Too Many Requests when exceeded
- Include rate limit headers
- Different limits for different endpoints
- Store rate limit data in Redis or database

## Testing Challenges

### Challenge 13: API Testing Suite
Write comprehensive tests for your APIs.

**Requirements**:
- Test all HTTP methods
- Test error cases (400, 404, 500)
- Test validation
- Test pagination
- Test filtering and sorting
- Use Jest or Vitest

### Challenge 14: API Documentation
Create comprehensive API documentation.

**Requirements**:
- Document all endpoints
- Include request/response examples
- List all parameters and their types
- Document error responses
- Add authentication requirements
- Use Markdown or OpenAPI/Swagger

## Real-World Scenarios

### Challenge 15: E-commerce Checkout Flow
Build a complete checkout API flow.

**Requirements**:
1. Validate cart items and inventory
2. Calculate totals (subtotal, tax, shipping)
3. Apply discount codes
4. Process payment (mock)
5. Create order
6. Update inventory
7. Send confirmation (mock)
8. Handle errors at each step

### Challenge 16: Multi-tenant API
Create an API that supports multiple stores.

**Requirements**:
- Each store has its own products
- Filter data by store ID
- Validate user has access to store
- Support store-specific settings
- Aggregate data across stores for admin

### Challenge 17: API Versioning
Implement API versioning.

**Requirements**:
- Support v1 and v2 of products API
- v2 has different response format
- Maintain backward compatibility
- Use URL versioning (`/api/v1/products`)
- Document differences between versions

## Performance Challenges

### Challenge 18: Caching Strategy
Implement caching for your APIs.

**Requirements**:
- Cache frequently accessed data
- Set appropriate cache headers
- Implement cache invalidation
- Use Redis or in-memory cache
- Measure performance improvement

### Challenge 19: Database Query Optimization
Optimize slow API endpoints.

**Requirements**:
- Identify slow queries
- Add database indexes
- Use query explain plans
- Implement pagination
- Reduce N+1 queries
- Measure query performance

### Challenge 20: API Load Testing
Test your API under load.

**Requirements**:
- Use tool like k6 or Artillery
- Test with 100+ concurrent users
- Identify bottlenecks
- Optimize slow endpoints
- Document performance metrics

## Bonus Challenges

### Challenge 21: Webhook System
Create a webhook notification system.

**Requirements**:
- POST `/api/webhooks` - Register webhook
- Trigger webhooks on events (order created, etc.)
- Retry failed webhooks
- Include webhook signature for security
- Log webhook deliveries

### Challenge 22: File Upload API
Build an API for file uploads.

**Requirements**:
- POST `/api/upload` - Upload file
- Validate file type and size
- Store in cloud storage (S3, Cloudinary)
- Generate thumbnail for images
- Return file URL

### Challenge 23: Export API
Create an API to export data.

**Requirements**:
- GET `/api/export/products` - Export products
- Support CSV and JSON formats
- Accept filters (date range, category)
- Stream large datasets
- Include download headers

## Tips for Success

1. **Start Simple**: Begin with basic CRUD operations
2. **Test Thoroughly**: Test all success and error cases
3. **Handle Errors**: Always return appropriate status codes
4. **Validate Input**: Never trust client data
5. **Document**: Write clear API documentation
6. **Optimize**: Profile and optimize slow endpoints
7. **Secure**: Implement authentication and authorization
8. **Monitor**: Log errors and track API usage

## Resources

- [HTTP Status Codes](https://httpstatuses.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [API Design Patterns](https://swagger.io/resources/articles/best-practices-in-api-design/)
- [Testing APIs](https://www.postman.com/api-testing/)

## Next Steps

After completing these challenges:
1. Review your code for improvements
2. Add comprehensive error handling
3. Write API documentation
4. Implement authentication (Module 4)
5. Deploy your API to production

Good luck! 🚀
