# Exercise 01: API Basics

Learn the fundamentals of APIs by building simple endpoints and understanding the request-response cycle.

## Learning Objectives

- Understand what APIs are and why we need them
- Create your first API endpoint
- Test APIs using browser and console
- Understand JSON responses
- Learn about status codes

## Prerequisites

- Next.js project running
- Basic JavaScript/TypeScript knowledge
- Understanding of async/await

## Part 1: Your First API Endpoint (10 minutes)

### Task 1.1: Hello World API

Create a simple API that returns a greeting.

**File**: `app/api/hello/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from your first API!',
    timestamp: new Date().toISOString()
  });
}
```

**Test it**:
1. Start your dev server: `npm run dev`
2. Open browser: `http://localhost:3000/api/hello`
3. You should see JSON response

**Expected output**:
```json
{
  "message": "Hello from your first API!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Task 1.2: Test in Browser Console

Open browser console (F12) and try:

```javascript
// Fetch the API
const response = await fetch('/api/hello');
console.log('Status:', response.status); // 200
console.log('OK:', response.ok); // true

// Get the data
const data = await response.json();
console.log('Data:', data);
```

**Questions to answer**:
1. What is the status code? ___________
2. What does `response.ok` mean? ___________
3. What format is the data in? ___________

## Part 2: Dynamic Responses (15 minutes)

### Task 2.1: Personalized Greeting

Create an API that accepts a name parameter.

**File**: `app/api/greet/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get query parameter
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name') || 'Guest';
  
  return NextResponse.json({
    greeting: `Hello, ${name}!`,
    timestamp: new Date().toISOString()
  });
}
```

**Test it**:
```javascript
// Without parameter
fetch('/api/greet').then(r => r.json()).then(console.log);
// { greeting: "Hello, Guest!", ... }

// With parameter
fetch('/api/greet?name=Alice').then(r => r.json()).then(console.log);
// { greeting: "Hello, Alice!", ... }
```

### Task 2.2: Calculator API

Create an API that performs simple calculations.

**File**: `app/api/calculate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const a = parseFloat(searchParams.get('a') || '0');
  const b = parseFloat(searchParams.get('b') || '0');
  const operation = searchParams.get('op') || 'add';
  
  let result: number;
  
  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      result = b !== 0 ? a / b : 0;
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid operation' },
        { status: 400 }
      );
  }
  
  return NextResponse.json({
    operation,
    a,
    b,
    result
  });
}
```

**Test it**:
```javascript
// Addition
fetch('/api/calculate?a=10&b=5&op=add')
  .then(r => r.json())
  .then(console.log);
// { operation: "add", a: 10, b: 5, result: 15 }

// Division
fetch('/api/calculate?a=20&b=4&op=divide')
  .then(r => r.json())
  .then(console.log);
// { operation: "divide", a: 20, b: 4, result: 5 }
```

## Part 3: POST Requests (15 minutes)

### Task 3.1: Echo API

Create an API that echoes back what you send it.

**File**: `app/api/echo/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Echo successful',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}
```

**Test it**:
```javascript
fetch('/api/echo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Alice',
    age: 25,
    hobbies: ['reading', 'coding']
  })
})
  .then(r => r.json())
  .then(console.log);
```

**Expected output**:
```json
{
  "message": "Echo successful",
  "received": {
    "name": "Alice",
    "age": 25,
    "hobbies": ["reading", "coding"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Task 3.2: User Registration API (Simplified)

Create an API that accepts user data.

**File**: `app/api/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    
    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // In real app, you'd save to database
    // For now, just return success
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        username,
        email,
        // Never return password!
      }
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

**Test it**:
```javascript
// Valid registration
fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'alice',
    email: 'alice@example.com',
    password: 'securepass123'
  })
})
  .then(r => r.json())
  .then(console.log);

// Invalid (short password)
fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'bob',
    email: 'bob@example.com',
    password: 'short'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## Part 4: Status Codes (10 minutes)

### Task 4.1: Status Code Explorer

Create an API that returns different status codes.

**File**: `app/api/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = parseInt(searchParams.get('code') || '200');
  
  const messages: Record<number, string> = {
    200: 'OK - Request succeeded',
    201: 'Created - Resource created successfully',
    400: 'Bad Request - Invalid request',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - No permission',
    404: 'Not Found - Resource not found',
    500: 'Internal Server Error - Something went wrong'
  };
  
  const message = messages[code] || 'Unknown status code';
  
  return NextResponse.json(
    { 
      status: code,
      message,
      timestamp: new Date().toISOString()
    },
    { status: code }
  );
}
```

**Test it**:
```javascript
// Try different status codes
async function testStatus(code) {
  const response = await fetch(`/api/status?code=${code}`);
  const data = await response.json();
  console.log(`Status ${code}:`, response.ok, data.message);
}

testStatus(200); // true, "OK - Request succeeded"
testStatus(404); // false, "Not Found - Resource not found"
testStatus(500); // false, "Internal Server Error"
```

## Part 5: Error Handling (15 minutes)

### Task 5.1: Robust API with Error Handling

**File**: `app/api/divide/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get parameters
    const aParam = searchParams.get('a');
    const bParam = searchParams.get('b');
    
    // Validate parameters exist
    if (!aParam || !bParam) {
      return NextResponse.json(
        { error: 'Missing parameters. Provide a and b.' },
        { status: 400 }
      );
    }
    
    // Parse to numbers
    const a = parseFloat(aParam);
    const b = parseFloat(bParam);
    
    // Validate numbers
    if (isNaN(a) || isNaN(b)) {
      return NextResponse.json(
        { error: 'Parameters must be valid numbers' },
        { status: 400 }
      );
    }
    
    // Check for division by zero
    if (b === 0) {
      return NextResponse.json(
        { error: 'Cannot divide by zero' },
        { status: 400 }
      );
    }
    
    // Perform calculation
    const result = a / b;
    
    return NextResponse.json({
      a,
      b,
      result,
      operation: 'division'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test all cases**:
```javascript
// Success
fetch('/api/divide?a=10&b=2').then(r => r.json()).then(console.log);

// Missing parameter
fetch('/api/divide?a=10').then(r => r.json()).then(console.log);

// Invalid number
fetch('/api/divide?a=abc&b=2').then(r => r.json()).then(console.log);

// Division by zero
fetch('/api/divide?a=10&b=0').then(r => r.json()).then(console.log);
```

## Challenges

### Challenge 1: Weather API Mock
Create an API that returns mock weather data based on city name.

**Requirements**:
- GET `/api/weather?city=Tokyo`
- Return temperature, condition, humidity
- Handle missing city parameter
- Return 404 for unknown cities

### Challenge 2: Todo Counter
Create an API that counts todos by status.

**Requirements**:
- POST `/api/todos/count`
- Accept array of todos with status field
- Return count by status (pending, completed)
- Validate input data

### Challenge 3: Time Zone Converter
Create an API that converts time between zones.

**Requirements**:
- GET `/api/time?from=UTC&to=EST`
- Return current time in both zones
- Handle invalid timezone names

## Key Takeaways

- APIs are endpoints that return data (usually JSON)
- GET requests use query parameters
- POST requests use request body
- Status codes communicate success/failure
- Always validate input data
- Handle errors gracefully
- Test using browser console or curl

## Next Exercise

Continue to `02-get-endpoints.ts` to build real database-backed APIs!
