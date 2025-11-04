# Design Document: Edge Functions Learning Module

## Overview

The Edge Functions module (0.6) teaches developers when and how to use Supabase Edge Functions for complex backend operations. The module follows the established pattern of modules 0.3-0.5, providing a comprehensive learning experience through theory, hands-on exercises, reference materials, and practice challenges.

## Architecture

### Module Structure

```
Learning/0.6-Edge-Functions/
├── README.md                          # Module overview and learning path
├── QUICK-START.md                     # Rapid setup guide
├── .gitignore                         # Standard gitignore
├── edge-functions-reference.md        # Quick reference guide
├── practice-challenges.md             # Optional challenges
├── exercises/
│   ├── 01-hello-edge-function.md     # Basic Edge Function
│   ├── 02-stripe-payment.md          # Payment processing
│   ├── 03-email-notifications.md     # Email sending
│   ├── 04-external-api.md            # API integration
│   ├── 05-scheduled-tasks.md         # Cron jobs
│   └── 06-complete-checkout.md       # Full implementation
├── theory/
│   ├── edge-functions-fundamentals.md # Core concepts
│   └── serverless-patterns.md         # Design patterns
└── examples/
    └── complete-order-processing.ts   # Production example
```

### Content Flow

```
README → QUICK-START → Theory → Exercises → Challenges
   ↓         ↓           ↓         ↓           ↓
Overview   Setup    Concepts   Practice   Mastery
```

## Components and Interfaces

### 1. README.md

**Purpose**: Module entry point providing overview and navigation

**Sections**:
- Module title and description
- "What You'll Learn" bullet list
- "Why Edge Functions?" explanation
- "When to Use Edge Functions" decision guide
- Quick Start section
- Structure overview
- Prerequisites list
- Learning Path with 6 exercises
- Key Concepts with code examples
- Resources links
- Next Steps

**Key Decision Guide Table**:
| Use Case | Solution | Reason |
|----------|----------|--------|
| Simple CRUD | Direct DB | RLS handles security |
| Payment processing | Edge Function | Hide API keys |
| Email sending | Edge Function | Server-side only |
| External APIs | Edge Function | Hide credentials |
| Complex calculations | Edge Function | Heavy processing |
| Scheduled tasks | Edge Function | Cron support |

### 2. QUICK-START.md

**Purpose**: Get developers running their first Edge Function in 15 minutes

**Sections**:
- Prerequisites checklist
- Supabase CLI installation
- Create first Edge Function
- Test locally
- Deploy to Supabase
- Call from frontend
- Troubleshooting common issues
- Next steps

**Code Examples**:
- CLI commands for setup
- Basic Edge Function template
- Frontend invocation code
- Environment variable configuration

### 3. Theory Files

#### edge-functions-fundamentals.md

**Purpose**: Explain core concepts using relatable analogies

**Sections**:
- What are Edge Functions?
- Frontend analogy: "Functions that run on a different computer"
- Serverless computing explained
- Edge Functions vs API Routes comparison table
- When to use Edge Functions (decision tree)
- How Edge Functions work (request-response flow)
- Deno vs Node.js differences
- Security benefits
- Performance considerations
- Cost implications
- Key takeaways

**Analogies**:
- Edge Functions = Kitchen in a restaurant (hidden from customers)
- API Routes = Waiter (visible, takes orders)
- Direct DB Access = Self-service buffet (customers serve themselves)

#### serverless-patterns.md

**Purpose**: Teach common patterns and best practices

**Sections**:
- Stateless function design
- Error handling patterns
- Retry logic
- Idempotency
- Webhook patterns
- Background job patterns
- API composition
- Circuit breaker pattern
- Timeout handling
- Logging and monitoring

### 4. Exercise Files

#### Exercise 01: Hello Edge Function (15 minutes)

**Learning Objectives**:
- Set up Supabase CLI
- Create first Edge Function
- Test locally
- Deploy to Supabase
- Call from frontend

**Tasks**:
- Install Supabase CLI
- Initialize Edge Functions
- Create hello-world function
- Test with curl
- Deploy function
- Call from React component
- View logs

**Code Provided**:
- Complete Edge Function code
- Frontend invocation example
- Testing commands

#### Exercise 02: Stripe Payment Processing (30 minutes)

**Learning Objectives**:
- Integrate Stripe API
- Handle payment intents
- Secure API key management
- Error handling for payments
- Webhook verification

**Tasks**:
- Set up Stripe account
- Configure environment variables
- Create payment intent function
- Handle payment confirmation
- Implement error handling
- Test with Stripe test cards
- Add webhook handler

**Code Provided**:
- Stripe integration code
- Payment intent creation
- Webhook verification
- Frontend payment form

#### Exercise 03: Email Notifications (25 minutes)

**Learning Objectives**:
- Send emails from Edge Functions
- Use email service (Resend/SendGrid)
- Template emails
- Handle email errors
- Queue email sending

**Tasks**:
- Set up email service
- Create email sending function
- Design email templates
- Send order confirmation
- Handle delivery failures
- Test email sending

**Code Provided**:
- Email service integration
- Template rendering
- Error handling
- Frontend trigger

#### Exercise 04: External API Integration (30 minutes)

**Learning Objectives**:
- Call external APIs securely
- Handle API rate limits
- Cache API responses
- Transform API data
- Error handling for external services

**Tasks**:
- Choose external API (weather, currency, etc.)
- Create integration function
- Implement caching
- Handle rate limits
- Transform response data
- Error handling

**Code Provided**:
- API client setup
- Caching implementation
- Rate limit handling
- Data transformation

#### Exercise 05: Scheduled Tasks (25 minutes)

**Learning Objectives**:
- Set up cron jobs
- Schedule periodic tasks
- Handle long-running operations
- Implement cleanup tasks
- Monitor scheduled functions

**Tasks**:
- Create cron function
- Configure schedule
- Implement cleanup logic
- Add logging
- Test locally
- Deploy and verify

**Code Provided**:
- Cron function template
- Schedule configuration
- Cleanup logic examples
- Monitoring setup

#### Exercise 06: Complete Checkout Flow (45 minutes)

**Learning Objectives**:
- Combine multiple operations
- Implement transaction logic
- Handle complex error scenarios
- Coordinate multiple services
- Build production-ready function

**Tasks**:
- Validate cart items
- Check inventory
- Calculate totals
- Process payment
- Create order
- Send confirmation email
- Update inventory
- Handle rollback on errors

**Code Provided**:
- Complete checkout function
- Transaction handling
- Error recovery
- Frontend integration

### 5. edge-functions-reference.md

**Purpose**: Quick lookup for syntax and patterns

**Sections**:
- Basic Edge Function structure
- Calling from frontend
- Environment variables
- Request handling (GET, POST, headers, body)
- Response patterns (success, error, streaming)
- CORS configuration
- Authentication verification
- Database access from Edge Functions
- External API calls
- Error handling patterns
- Testing commands
- Deployment commands
- Logging and debugging
- Common patterns (payment, email, webhooks)
- Best practices checklist

**Format**: Code-heavy with minimal explanation, organized by use case

### 6. practice-challenges.md

**Purpose**: Reinforce learning through optional challenges

**Structure**:
- Beginner Challenges (5 challenges)
  - Temperature converter API
  - Random data generator
  - Simple webhook receiver
  - Text transformation service
  - Image metadata extractor

- Intermediate Challenges (5 challenges)
  - Multi-step order processing
  - PDF generation service
  - SMS notification system
  - Data export service
  - API rate limiter

- Advanced Challenges (5 challenges)
  - Payment subscription system
  - Real-time analytics aggregator
  - Multi-provider email fallback
  - Distributed task queue
  - API gateway with routing

- Expert Challenges (3 challenges)
  - Complete SaaS billing system
  - Event-driven architecture
  - Multi-tenant background jobs

- Real-World Scenarios (2 challenges)
  - E-commerce order fulfillment
  - Content moderation pipeline

**Each Challenge Includes**:
- Clear requirements
- Expected inputs/outputs
- Hints (not solutions)
- Testing criteria

### 7. examples/complete-order-processing.ts

**Purpose**: Production-ready reference implementation

**Features**:
- Complete order processing flow
- Stripe payment integration
- Email notifications
- Inventory management
- Error handling and rollback
- Logging and monitoring
- TypeScript types
- Comprehensive comments
- Testing examples

## Data Models

### Edge Function Request
```typescript
interface EdgeFunctionRequest {
  method: string;
  headers: Headers;
  body?: any;
  url: string;
}
```

### Edge Function Response
```typescript
interface EdgeFunctionResponse {
  status: number;
  headers?: Record<string, string>;
  body: any;
}
```

### Payment Intent (Stripe Example)
```typescript
interface PaymentIntent {
  amount: number;
  currency: string;
  metadata: {
    orderId: string;
    userId: string;
  };
}
```

### Email Notification
```typescript
interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  from?: string;
}
```

### Order Processing
```typescript
interface OrderRequest {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethodId: string;
  shippingAddress: Address;
}

interface OrderResponse {
  orderId: string;
  status: 'success' | 'failed';
  paymentStatus: string;
  total: number;
  error?: string;
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
```

### Error Categories
1. **Validation Errors** (400): Invalid input data
2. **Authentication Errors** (401): Missing or invalid auth
3. **Authorization Errors** (403): Insufficient permissions
4. **Not Found Errors** (404): Resource doesn't exist
5. **External Service Errors** (502): Third-party API failures
6. **Timeout Errors** (504): Function execution timeout
7. **Internal Errors** (500): Unexpected failures

### Error Handling Pattern
```typescript
try {
  // Main logic
} catch (error) {
  console.error('Function error:', error);
  
  if (error instanceof ValidationError) {
    return new Response(JSON.stringify({
      error: error.message,
      code: 'VALIDATION_ERROR'
    }), { status: 400 });
  }
  
  // Generic error
  return new Response(JSON.stringify({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }), { status: 500 });
}
```

## Testing Strategy

### Local Testing
- Use Supabase CLI `serve` command
- Test with curl commands
- Use Postman/Insomnia for complex requests
- Mock external services

### Integration Testing
- Deploy to staging environment
- Test with real services (Stripe test mode)
- Verify email delivery (test email addresses)
- Check database state changes

### Testing Checklist
- ✓ Function responds correctly
- ✓ Error handling works
- ✓ Authentication verified
- ✓ External services called correctly
- ✓ Database updates successful
- ✓ Logs captured
- ✓ Performance acceptable

### Example Test Commands
```bash
# Test locally
supabase functions serve hello-world

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Test"}'

# Deploy to staging
supabase functions deploy hello-world --project-ref staging-ref

# View logs
supabase functions logs hello-world
```

## Content Guidelines

### Writing Style
- Use conversational, developer-friendly tone
- Explain concepts with frontend analogies
- Provide complete, working code examples
- Include "why" explanations, not just "how"
- Use tables for comparisons
- Add diagrams for complex flows
- Keep paragraphs short and scannable

### Code Examples
- Always provide complete, runnable code
- Include TypeScript types
- Add helpful comments
- Show both success and error cases
- Include testing instructions
- Provide frontend integration examples

### Consistency
- Follow existing module patterns (0.3, 0.4, 0.5)
- Use same heading hierarchy
- Maintain consistent terminology
- Use same code block formatting
- Include same sections in exercises

## Implementation Notes

### Prerequisites
- Modules 0.3, 0.4, 0.5 completed
- Supabase project set up
- Basic understanding of async/await
- Familiarity with API concepts

### External Dependencies
- Supabase CLI
- Deno (installed with CLI)
- Stripe account (for payment exercises)
- Email service account (Resend or SendGrid)

### Environment Variables
```
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
```

### File Naming Conventions
- Exercise files: `01-exercise-name.md` (numbered, kebab-case)
- Theory files: `concept-name.md` (kebab-case)
- Example files: `descriptive-name.ts` (kebab-case)

## Success Criteria

The module is successful when learners can:
1. Explain when to use Edge Functions vs direct database access
2. Create and deploy basic Edge Functions
3. Integrate payment processing with Stripe
4. Send emails from Edge Functions
5. Call external APIs securely
6. Set up scheduled tasks
7. Build complex multi-step operations
8. Handle errors gracefully
9. Test Edge Functions locally and in production
10. Apply Edge Functions to real-world projects

## Future Enhancements

Potential additions for future versions:
- WebSocket support in Edge Functions
- Advanced caching strategies
- Multi-region deployment
- Performance optimization techniques
- Cost optimization strategies
- Advanced monitoring and alerting
- Integration with other Supabase features (Storage, Realtime)
