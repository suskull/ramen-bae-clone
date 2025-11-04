# Exercise 01: Hello World Edge Function

Learn the fundamentals of Edge Functions by creating, testing, and deploying your first serverless function.

## Learning Objectives

- Install and configure Supabase CLI
- Create your first Edge Function
- Test functions locally
- Deploy functions to Supabase
- Call functions from the frontend
- View function logs
- Understand the Edge Function lifecycle

## Prerequisites

- Supabase project created
- Node.js installed (v18 or higher)
- Basic understanding of TypeScript
- Completed Module 5 (Supabase Ecosystem)

## Estimated Time

15 minutes

## Part 1: Install Supabase CLI (3 minutes)

### Task 1.1: Install CLI

Choose your installation method:

**macOS/Linux (Homebrew)**:
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop)**:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows (Chocolatey)**:
```bash
choco install supabase
```

**Linux (Direct Download)**:
```bash
# Download and install the binary
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

**Note**: Do NOT use `npm install -g supabase` - the CLI is not distributed via npm.

### Task 1.2: Verify Installation

```bash
supabase --version
```

**Expected output**:
```
1.x.x
```

### Task 1.3: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate. Follow the prompts.

## Part 2: Link Your Project (2 minutes)

### Task 2.1: Find Your Project Reference ID

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **General**
4. Copy the **Reference ID**

### Task 2.2: Link Project

```bash
# Navigate to your project directory
cd your-project-directory

# Link to Supabase project
supabase link --project-ref your-project-ref
```

**Expected output**:
```
Linked to project: your-project-name
```

## Part 3: Create Your First Function (3 minutes)

### Task 3.1: Create Function

```bash
supabase functions new hello-world
```

This creates: `supabase/functions/hello-world/index.ts`

### Task 3.1.5: Configure JWT Verification (Security)

Create `supabase/config.toml` in your project root:

```toml
[functions.hello-world]
verify_jwt = true
```

**Why this matters**: This enables JWT authentication, making your function secure for production use.

### Task 3.2: Write Function Code

Open `supabase/functions/hello-world/index.ts` and replace with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Get auth header (JWT verification is handled by Supabase)
    const authHeader = req.headers.get('Authorization');
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Get user info (optional - JWT is already verified by Supabase)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Parse request body
    const { name } = await req.json();
    
    // Create response data
    const data = {
      message: `Hello ${name || 'World'}!`,
      timestamp: new Date().toISOString(),
      method: req.method,
      authenticated: !!user,
      userRole: user?.role || 'anonymous',
    };
    
    // Return JSON response
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ 
        error: 'Invalid request',
        message: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

**What's happening here?**
- `serve()` - Deno's HTTP server function
- `req.json()` - Parse request body
- `new Response()` - Create HTTP response
- Error handling with try/catch

## Part 4: Test Locally (4 minutes)

### Task 4.1: Start Local Server

```bash
supabase functions serve hello-world
```

**Expected output**:
```
Serving functions on http://localhost:54321/functions/v1/
hello-world: http://localhost:54321/functions/v1/hello-world
```

Keep this terminal running!

### Task 4.2: Test with curl

Open a new terminal and run:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Developer"}'
```

**JWT Token**: This uses the default local development JWT token for authentication.

**Expected response**:
```json
{
  "message": "Hello Developer!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "POST"
}
```

### Task 4.3: Test Different Inputs

```bash
# Without name
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{}'

# With different name
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Alice"}'
```

## Part 5: Deploy to Supabase (2 minutes)

### Task 5.1: Deploy Function

```bash
supabase functions deploy hello-world
```

**Expected output**:
```
Deploying function hello-world...
Function deployed successfully!
URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/hello-world
```

### Task 5.2: Test Deployed Function

```bash
curl -i --location --request POST 'https://nfydvfhrepavcyclzfrh.supabase.co/functions/v1/hello-world' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5meWR2ZmhyZXBhdmN5Y2x6ZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTkyMjUsImV4cCI6MjA3NzE5NTIyNX0.Pvu-mNu1B2MdLdQVA0kEwd-r-gv_Q8zkITCPMm9_LC4' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Production"}'
```

**Note**: For production, use your actual anon key from Supabase Dashboard → Project Settings → API.

## Part 6: Call from Frontend (3 minutes)

### Task 6.1: Create React Component

**File**: `components/hello-world-test.tsx`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function HelloWorldTest() {
  const [name, setName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const callFunction = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'hello-world',
        {
          body: { name: name || 'World' }
        }
      );
      
      if (functionError) {
        setError(functionError.message);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Test Edge Function</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
          />
        </div>
        
        <button
          onClick={callFunction}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Calling...' : 'Call Function'}
        </button>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {error}
          </div>
        )}
        
        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="font-medium mb-2">Response:</p>
            <pre className="text-xs overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task 6.2: Use Component

Add to any page:

```typescript
import HelloWorldTest from '@/components/hello-world-test';

export default function TestPage() {
  return (
    <div>
      <h1>Edge Function Test</h1>
      <HelloWorldTest />
    </div>
  );
}
```

### Task 6.3: Test in Browser

1. Start your dev server: `npm run dev`
2. Navigate to your test page
3. Enter a name and click "Call Function"
4. See the response!

## Part 7: View Logs (2 minutes)

### Task 7.1: View Function Logs

**Method 1: Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Edge Functions** → **hello-world**
4. Click **Logs** tab
5. You'll see all function executions and console.log outputs

**Method 2: Add Logging to Function**
Your function already has console.log statements that will appear in the dashboard:

```typescript
console.log(`🚀 Function called with method: ${req.method}`);
console.log('✅ Preflight request handled');
console.log('📝 Processing actual request...');
```

### Task 7.2: Real-Time Log Monitoring

1. Keep the Supabase Dashboard logs page open
2. Make requests from your test page
3. Watch logs appear in real-time
4. You should see both OPTIONS and POST requests

## Troubleshooting

### "Function not found"

```bash
# List all functions
supabase functions list

# Redeploy if needed
supabase functions deploy hello-world
```

### "Authorization header required"

Make sure you're using the correct JWT token:
```bash
# Use the local development JWT token
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
```

### "Invalid JWT"

This usually means:
- Using publishable key instead of JWT token
- JWT token is expired
- Wrong environment (production key with local server)

**Solution**: Use the correct local development JWT token shown above.

### Local server won't start

```bash
# Check if port is in use
lsof -ti:54321 | xargs kill -9

# Restart
supabase functions serve hello-world
```

## Challenges

### Challenge 1: Add More Data
Modify the function to return additional information:
- User agent from request headers
- Request URL
- Current day of week

### Challenge 2: Greeting by Time
Return different greetings based on time of day:
- "Good morning" (6am-12pm)
- "Good afternoon" (12pm-6pm)
- "Good evening" (6pm-12am)
- "Good night" (12am-6am)

### Challenge 3: Input Validation
Add validation to ensure:
- Name is provided
- Name is at least 2 characters
- Name contains only letters and spaces
- Return appropriate error messages

### Challenge 4: Multiple Languages
Accept a `language` parameter and return greetings in different languages:
- English: "Hello"
- Spanish: "Hola"
- French: "Bonjour"
- Japanese: "こんにちは"

### Challenge 5: Rate Limiting ✅ COMPLETED
Implement simple rate limiting:
- Track requests in a Map (for learning purposes)
- Limit to 10 requests per minute per IP
- Return 429 status when exceeded

**Implementation**: See `CHALLENGE-5-RATE-LIMITING.md` for the complete implementation guide and testing instructions.

## Key Takeaways

- Edge Functions run on Supabase's servers, not in the browser
- Use `serve()` from Deno standard library
- Test locally before deploying
- Deploy with `supabase functions deploy`
- Call from frontend with `supabase.functions.invoke()`
- View logs with `supabase functions logs`
- Always handle errors gracefully
- Include proper headers in responses

## Next Exercise

Continue to Exercise 02 to integrate Stripe payment processing!

