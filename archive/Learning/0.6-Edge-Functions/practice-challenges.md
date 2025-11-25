# Practice Challenges: Edge Functions

Test your Edge Functions skills with these real-world challenges!

## Beginner Challenges

### Challenge 1: Temperature Converter API
Create an Edge Function that converts temperatures between Celsius, Fahrenheit, and Kelvin.

**Requirements**:
- Accept temperature value and source unit
- Return converted values in all three units
- Validate input ranges
- Handle invalid units

**Example**:
```json
{
  "value": 25,
  "unit": "celsius"
}
```

**Response**:
```json
{
  "celsius": 25,
  "fahrenheit": 77,
  "kelvin": 298.15
}
```

### Challenge 2: Random Data Generator
Build a function that generates random test data for development.

**Requirements**:
- Generate random users, products, or orders
- Accept count parameter
- Support different data types
- Return realistic fake data

### Challenge 3: Simple Webhook Receiver
Create a webhook receiver that logs incoming webhooks.

**Requirements**:
- Accept POST requests
- Verify signature (optional)
- Store webhook data in database
- Return acknowledgment

### Challenge 4: Text Transformation Service
Build a function that transforms text in various ways.

**Requirements**:
- Support uppercase, lowercase, title case
- Reverse text
- Count words and characters
- Remove special characters

### Challenge 5: Image Metadata Extractor
Create a function that extracts metadata from image URLs.

**Requirements**:
- Fetch image from URL
- Extract dimensions, format, size
- Return metadata as JSON
- Handle invalid URLs

## Intermediate Challenges

### Challenge 6: Multi-Step Order Processing
Build a function that processes orders with multiple steps.

**Requirements**:
- Validate order data
- Check inventory
- Calculate totals with tax
- Create order record
- Send confirmation
- Handle partial failures

### Challenge 7: PDF Generation Service
Create a function that generates PDF invoices.

**Requirements**:
- Accept order data
- Generate PDF with order details
- Upload to Supabase Storage
- Return PDF URL
- Handle large orders

### Challenge 8: SMS Notification System
Build a function that sends SMS notifications via Twilio.

**Requirements**:
- Integrate Twilio API
- Send SMS to phone number
- Handle delivery status
- Log all SMS sent
- Implement rate limiting

### Challenge 9: Data Export Service
Create a function that exports data to CSV or JSON.

**Requirements**:
- Query database for data
- Format as CSV or JSON
- Upload to Storage
- Return download URL
- Support large datasets

### Challenge 10: API Rate Limiter
Implement a rate limiting middleware function.

**Requirements**:
- Track requests per user/IP
- Multiple time windows (minute, hour, day)
- Return rate limit headers
- Block when exceeded
- Store in Redis or database

## Advanced Challenges

### Challenge 11: Payment Subscription System
Build a complete subscription management system.

**Requirements**:
- Create subscriptions with Stripe
- Handle recurring billing
- Process webhooks
- Manage subscription status
- Handle failed payments
- Send renewal reminders

### Challenge 12: Real-time Analytics Aggregator
Create a function that aggregates analytics data.

**Requirements**:
- Accept analytics events
- Aggregate by time periods
- Calculate metrics (views, conversions)
- Store in database
- Return real-time stats

### Challenge 13: Multi-Provider Email Fallback
Build an email service with multiple providers.

**Requirements**:
- Try primary provider (Resend)
- Fallback to secondary (SendGrid)
- Fallback to tertiary (AWS SES)
- Track delivery success rate
- Log all attempts

### Challenge 14: Distributed Task Queue
Implement a task queue system.

**Requirements**:
- Accept tasks with priority
- Store in database queue
- Process tasks in order
- Handle retries on failure
- Track task status
- Support scheduled tasks

### Challenge 15: API Gateway with Routing
Create an API gateway that routes to different services.

**Requirements**:
- Route based on path
- Transform requests/responses
- Add authentication
- Implement caching
- Log all requests
- Handle service failures

## Expert Challenges

### Challenge 16: Complete SaaS Billing System
Build a full billing system for a SaaS application.

**Requirements**:
- Multiple subscription tiers
- Usage-based billing
- Proration on upgrades/downgrades
- Invoice generation
- Payment retry logic
- Dunning management
- Tax calculation
- Webhook handling

### Challenge 17: Event-Driven Architecture
Implement an event-driven system.

**Requirements**:
- Event bus for publishing events
- Multiple event handlers
- Event replay capability
- Dead letter queue
- Event versioning
- Monitoring and alerting

### Challenge 18: Multi-Tenant Background Jobs
Create a background job system for multi-tenant apps.

**Requirements**:
- Tenant isolation
- Job scheduling per tenant
- Resource limits per tenant
- Priority queues
- Job dependencies
- Failure handling
- Monitoring dashboard

## Real-World Scenarios

### Challenge 19: E-commerce Order Fulfillment
Build a complete order fulfillment system.

**Requirements**:
1. Receive order
2. Validate inventory across warehouses
3. Calculate shipping costs
4. Process payment
5. Create shipment
6. Update inventory
7. Send tracking email
8. Handle returns
9. Process refunds
10. Generate reports

### Challenge 20: Content Moderation Pipeline
Create an automated content moderation system.

**Requirements**:
1. Accept user-generated content
2. Check for profanity
3. Scan images with AI
4. Detect spam patterns
5. Flag suspicious content
6. Queue for human review
7. Auto-approve safe content
8. Notify users of decisions
9. Track moderation metrics
10. Generate reports

## Tips for Success

1. **Start Simple**: Begin with basic functionality
2. **Test Thoroughly**: Test all success and error cases
3. **Handle Errors**: Implement comprehensive error handling
4. **Log Everything**: Add detailed logging for debugging
5. **Optimize**: Profile and optimize slow operations
6. **Document**: Write clear documentation
7. **Secure**: Never expose secrets
8. **Monitor**: Track performance and errors

## Testing Checklist

- [ ] Function responds correctly
- [ ] Error handling works
- [ ] Authentication verified
- [ ] Input validation complete
- [ ] External services called correctly
- [ ] Database updates successful
- [ ] Logs captured
- [ ] Performance acceptable
- [ ] Edge cases handled
- [ ] Documentation written

## Resources

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Stripe API](https://stripe.com/docs/api)
- [Twilio API](https://www.twilio.com/docs)
- [Resend API](https://resend.com/docs)

## Next Steps

After completing these challenges:
1. Review your implementations
2. Optimize for performance
3. Add comprehensive error handling
4. Write tests
5. Deploy to production
6. Monitor and iterate

Good luck! 🚀
