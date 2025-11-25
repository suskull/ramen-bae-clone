# Exercise 03: Email Notifications

Learn to send transactional emails from Edge Functions using Resend API with modern patterns and beautiful templates.

> **📚 Documentation Source**: This exercise uses Context7 MCP to fetch the latest Resend API documentation and best practices.

## Learning Objectives

- Set up Resend email service
- Send transactional emails with templates
- Create beautiful HTML email templates
- Handle email delivery errors
- Test email sending locally
- Track email delivery
- Implement email logging

## Prerequisites

- Completed Exercise 02 (Stripe Payment Processing)
- Resend account (free tier: 100 emails/day)
- Understanding of HTML/CSS for emails
- Local Supabase instance running

## Estimated Time

30 minutes

## What You'll Build

- `send-email` Edge Function with template support
- Three email templates: Welcome, Order Confirmation, Password Reset
- Email logging system
- Frontend component for testing
- Automated test script

## Part 1: Resend Setup (5 minutes)

### Task 1.1: Create Resend Account

1. Visit [resend.com](https://resend.com)
2. Sign up for a free account
   - **Free tier**: 100 emails/day, 3,000/month
   - No credit card required
3. Verify your email address

### Task 1.2: Get API Key

1. Go to Resend Dashboard → **API Keys**
2. Click **Create API Key**
3. Name: `Supabase Edge Functions - Development`
4. Permissions: **Full Access** (for development)
5. Copy the API key (starts with `re_`)
   - ⚠️ **Save it now** - you won't see it again!

### Task 1.3: Configure Environment Variables

Add to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # For testing
```

For production deployment:

```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Task 1.4: Verify Domain (Production Only)

For production emails from your domain:

1. Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain:
   - SPF record (TXT)
   - DKIM record (CNAME)
   - DMARC record (TXT) - optional but recommended
5. Wait for verification (usually 5-10 minutes)

**For this exercise**, use the test sender: `onboarding@resend.dev`

## Part 2: Email Edge Function (10 minutes)

### Task 2.1: Review Function Code

The `send-email` Edge Function has been created at `supabase/functions/send-email/index.ts` with:

✅ Modern `Deno.serve()` pattern (no deprecated imports)  
✅ Shared CORS utility for consistent handling  
✅ Enhanced logging with emojis  
✅ Three beautiful email templates  
✅ Support for multiple recipients, CC, BCC  
✅ Proper error handling  
✅ Email logging (optional)

**Key Features:**

```typescript
// Modern Deno.serve pattern
Deno.serve(async (req) => {
  console.log('📧 Send Email function called');
  
  // Shared CORS handling
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  // User authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Template support
  if (template) {
    const generated = generateEmailFromTemplate(template, templateData);
    emailHtml = generated.html;
  }
  
  // Send via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  });
});
```

### Task 2.2: Start Local Function

Start the Edge Function locally:

```bash
supabase functions serve send-email --env-file .env.local --no-verify-jwt
```

You should see:
```
✅ send-email function ready
📧 Listening on http://127.0.0.1:54321/functions/v1/send-email
```

### Task 2.3: Run Automated Tests

Use the provided test script:

```bash
./test-send-email.sh
```

This tests:
1. ✅ Welcome email template
2. ✅ Order confirmation template
3. ✅ Custom HTML email
4. ✅ Multiple recipients with CC
5. ✅ Error handling

Expected output:
```
🧪 Testing Send Email Edge Function
====================================

🔑 Getting JWT token...
✅ JWT token obtained

📧 Test 1: Sending welcome email...
✅ Welcome email sent successfully
Response: {"success":true,"emailId":"4ef2ae98-..."}

📧 Test 2: Sending order confirmation...
✅ Order confirmation sent successfully
...
```

### Task 2.4: Manual Testing with cURL

Get a JWT token first:

```bash
node get-test-jwt.js
```

Then test the function:

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiI1Yzg4MjcxMC04NzgwLTQyMzAtODA4Ni1kMjU3MWEzMGYwYzIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyMjMyNjkyLCJpYXQiOjE3NjIyMjkwOTIsImVtYWlsIjoidXNlckB0ZXN0LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJSZWd1bGFyIFVzZXIifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MjIyOTA5Mn1dLCJzZXNzaW9uX2lkIjoiNDI1MGEyOTYtMjM1MS00OTc0LTg5MTAtNThkOTE2YjkxZGY0IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.XDinr9int4l-aLrD64UewzjCsAAbkMIXeLgdELnrCXE' \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "template": "welcome",
    "templateData": {
      "name": "John Doe",
      "dashboardUrl": "https://yourapp.com/dashboard"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "emailId": "4ef2ae98-7ab1-4edd-9cb1-3e8f3e3e3e3e",
  "message": "Email sent successfully"
}
```

### Task 2.5: Check Email Delivery

1. **Check your inbox** for the test email
2. **Resend Dashboard** → **Emails** to see delivery status
3. **Edge Function logs**:
   ```bash
   supabase functions logs send-email --tail
   ```

### Task 2.6: Deploy to Production

When ready for production:

```bash
# Set production secrets
supabase secrets set RESEND_API_KEY=re_your_production_key
supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com

# Deploy function
supabase functions deploy send-email

# Test production endpoint
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_PRODUCTION_JWT' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","subject":"Production Test","template":"welcome","templateData":{"name":"Test"}}'
```

## Part 3: Email Templates (5 minutes)

### Task 3.1: Review Template System

The function includes three pre-built templates with modern, responsive designs:

**1. Welcome Email**
- Gradient header with emoji
- Clean, professional layout
- Call-to-action button
- Responsive design

**2. Order Confirmation**
- Order details table
- Item breakdown
- Total calculation
- Shipping notification

**3. Password Reset**
- Security warning
- Prominent reset button
- Link expiration notice
- Fallback plain link

### Task 3.2: Test Each Template

**Welcome Email:**
```bash
curl -X POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_JWT' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Welcome!",
    "template": "welcome",
    "templateData": {
      "name": "Sarah",
      "dashboardUrl": "https://app.example.com/dashboard"
    }
  }'
```

**Order Confirmation:**
```bash
curl -X POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_JWT' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Order Confirmed",
    "template": "order-confirmation",
    "templateData": {
      "name": "John",
      "orderId": "ORD-12345",
      "total": 149.97,
      "items": [
        {"name": "Product A", "quantity": 2, "price": 49.99},
        {"name": "Product B", "quantity": 1, "price": 49.99}
      ]
    }
  }'
```

**Password Reset:**
```bash
curl -X POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_JWT' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Reset Password",
    "template": "password-reset",
    "templateData": {
      "name": "Alex",
      "resetLink": "https://app.example.com/reset?token=abc123"
    }
  }'
```

### Task 3.3: Create Custom Template

Add your own template to the `generateEmailFromTemplate` function:

```typescript
case 'custom-template':
  return {
    subject: `Your Custom Subject`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Your custom styles */
          </style>
        </head>
        <body>
          <!-- Your custom HTML -->
        </body>
      </html>
    `,
    text: `Plain text version`,
  };
```

## Part 4: Frontend Integration (5 minutes)

### Task 4.1: Create Email Test Component

Create `components/send-email-test.tsx`:

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function SendEmailTest() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<'welcome' | 'order-confirmation' | 'password-reset'>('welcome');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  const supabase = createClient();

  const sendEmail = async () => {
    setLoading(true);
    setResult('');

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `Test ${template} Email`,
          template,
          templateData: { 
            name,
            dashboardUrl: 'https://yourapp.com/dashboard',
            orderId: 'ORD-12345',
            total: 99.99,
            items: [
              { name: 'Product A', quantity: 2, price: 29.99 },
              { name: 'Product B', quantity: 1, price: 39.99 }
            ],
            resetLink: 'https://yourapp.com/reset?token=test123'
          },
        }
      });

      if (error) throw error;

      setResult(`✅ Email sent successfully! ID: ${data.emailId}`);
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📧 Send Test Email</h2>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-sm">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="recipient@example.com"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-sm">Recipient Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-sm">Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="welcome">Welcome Email</option>
            <option value="order-confirmation">Order Confirmation</option>
            <option value="password-reset">Password Reset</option>
          </select>
        </div>

        <button
          onClick={sendEmail}
          disabled={loading || !email || !name}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? '📤 Sending...' : '📧 Send Email'}
        </button>

        {result && (
          <div className={`p-3 rounded text-sm ${
            result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task 4.2: Add to Test Page

Create or update `app/test-email/page.tsx`:

```typescript
import SendEmailTest from '@/components/send-email-test';

export default function TestEmailPage() {
  return (
    <div className="container mx-auto py-8">
      <SendEmailTest />
    </div>
  );
}
```

### Task 4.3: Test in Browser

1. Start your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000/test-email`
3. Fill in the form and send test emails
4. Check your inbox for the emails

## Part 5: Email Logging (5 minutes)

### Task 5.1: Create Email Logs Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create email_logs table
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  email_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'delivered')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert logs
CREATE POLICY "Service role can insert logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Task 5.2: View Email Logs

Query your email logs:

```sql
-- Recent emails
SELECT 
  id,
  to,
  subject,
  template,
  status,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 10;

-- Email stats by template
SELECT 
  template,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM email_logs
GROUP BY template;
```

### Task 5.3: Create Email History Component

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string | null;
  status: string;
  created_at: string;
}

export default function EmailHistory() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">📧 Email History</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.to}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.template || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Challenges

### Challenge 1: Email Queue System
Implement a queue system that processes emails in batches to avoid rate limits.

**Hints:**
- Create a `email_queue` table
- Add a cron job to process queued emails
- Implement retry logic for failed sends

### Challenge 2: Email Attachments
Add support for sending email attachments using Resend's attachment API.

**Hints:**
- Accept file uploads in the Edge Function
- Convert files to base64 or use URLs
- Add attachment metadata to email logs

### Challenge 3: Unsubscribe System
Implement an unsubscribe system for marketing emails.

**Hints:**
- Create `email_preferences` table
- Add unsubscribe link to email templates
- Check preferences before sending

### Challenge 4: Email Analytics
Track email opens and clicks using tracking pixels and links.

**Hints:**
- Add tracking pixel to HTML emails
- Create redirect endpoint for link tracking
- Store analytics in database

### Challenge 5: Multi-Language Support
Support sending emails in multiple languages based on user preference.

**Hints:**
- Create translation files for each language
- Store user language preference
- Select template based on language

### Challenge 6: React Email Integration
Use [React Email](https://react.email) for more sophisticated templates.

**Hints:**
- Install `@react-email/components`
- Create React email components
- Render to HTML in Edge Function

## Troubleshooting

### Email Not Sending

**Check:**
1. RESEND_API_KEY is set correctly
2. API key has proper permissions
3. From email is valid (use `onboarding@resend.dev` for testing)
4. Check Resend dashboard for errors

### Authentication Errors

**Check:**
1. JWT token is valid and not expired
2. User is authenticated
3. Authorization header is included

### Template Not Rendering

**Check:**
1. Template name matches exactly
2. All required templateData fields are provided
3. Check Edge Function logs for errors

### CORS Errors

**Check:**
1. Origin is in allowed origins list
2. CORS headers are being sent
3. Preflight requests are handled

## Key Takeaways

✅ Use Edge Functions to hide email API keys securely  
✅ Always authenticate users before sending emails  
✅ Use templates for consistent, professional email design  
✅ Log all sent emails for tracking and debugging  
✅ Handle delivery errors gracefully with proper error messages  
✅ Test with real email addresses in development  
✅ Use verified domains in production for better deliverability  
✅ Implement rate limiting to prevent abuse  
✅ Use Context7 MCP to stay updated with latest Resend API changes  
✅ Follow modern Deno patterns with `Deno.serve()`

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resend/resend-node)
- [React Email](https://react.email)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design-best-practices/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Next Exercise

Continue to **Exercise 04: Real-time Features** to learn about WebSockets, Realtime channels, and live data synchronization!
