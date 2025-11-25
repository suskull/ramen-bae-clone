# Integration Example: Stripe + Email Notifications

## Overview

This guide shows how to integrate Exercise 02 (Stripe Payment Processing) with Exercise 03 (Email Notifications) to send order confirmation emails after successful payments.

## Architecture

```
User Payment Flow:
1. User submits payment → create-payment-intent
2. Payment succeeds → Stripe webhook
3. Webhook processes → stripe-webhook function
4. Send confirmation → send-email function
5. User receives email ✉️
```

## Implementation

### Step 1: Update Stripe Webhook to Send Email

Modify `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { handleCors, createCorsResponse } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  console.log('🎣 Stripe webhook received');

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.log('❌ Missing Stripe signature');
    return createCorsResponse(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
      origin
    );
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type}`);

    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

      // Get customer email from metadata or payment intent
      const customerEmail = paymentIntent.receipt_email || 
                           paymentIntent.metadata?.email;
      const customerName = paymentIntent.metadata?.name || 'Customer';

      if (customerEmail) {
        // Send order confirmation email
        await sendOrderConfirmationEmail({
          email: customerEmail,
          name: customerName,
          orderId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert cents to dollars
          currency: paymentIntent.currency.toUpperCase(),
        });
      }

      // Update database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      console.log('✅ Payment processed and email sent');
    }

    return createCorsResponse(
      { received: true, type: event.type },
      { status: 200 },
      origin
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return createCorsResponse(
      { error: error.message },
      { status: 400 },
      origin
    );
  }
});

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(data: {
  email: string;
  name: string;
  orderId: string;
  amount: number;
  currency: string;
}) {
  console.log(`📧 Sending order confirmation to ${data.email}`);

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('⚠️  RESEND_API_KEY not set, skipping email');
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'orders@resend.dev',
        to: data.email,
        subject: `Order Confirmation #${data.orderId}`,
        html: generateOrderConfirmationHTML(data),
        text: generateOrderConfirmationText(data),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully! ID: ${result.id}`);

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    // Don't throw - email failure shouldn't fail the webhook
  }
}

/**
 * Generate order confirmation HTML
 */
function generateOrderConfirmationHTML(data: {
  name: string;
  orderId: string;
  amount: number;
  currency: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white; 
            padding: 40px 20px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content { padding: 40px 30px; background: #f9fafb; }
          .order-box {
            background: white;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
          }
          .order-id {
            font-size: 24px;
            font-weight: 600;
            color: #10b981;
            margin: 0 0 16px 0;
          }
          .amount {
            font-size: 36px;
            font-weight: 700;
            color: #059669;
            margin: 16px 0;
          }
          .footer {
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Thank you for your payment! Your transaction has been completed successfully.</p>
            
            <div class="order-box">
              <div class="order-id">Order #${data.orderId}</div>
              <div class="amount">${data.currency} ${data.amount.toFixed(2)}</div>
              <p style="margin: 0; color: #6b7280;">
                Payment Date: ${new Date().toLocaleDateString()}
              </p>
            </div>
            
            <p>You will receive your order details shortly. If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="font-size: 12px; color: #9ca3af;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate order confirmation plain text
 */
function generateOrderConfirmationText(data: {
  name: string;
  orderId: string;
  amount: number;
  currency: string;
}): string {
  return `
Payment Successful!

Hi ${data.name},

Thank you for your payment! Your transaction has been completed successfully.

Order #${data.orderId}
Amount: ${data.currency} ${data.amount.toFixed(2)}
Date: ${new Date().toLocaleDateString()}

You will receive your order details shortly.

Thank you for your business!
  `.trim();
}
```

### Step 2: Update Payment Intent Creation

Modify `supabase/functions/create-payment-intent/index.ts` to include customer email:

```typescript
// Add email to metadata
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount,
  currency: currency,
  metadata: {
    user_id: user.id,
    email: user.email,  // Add customer email
    name: user.user_metadata?.full_name || 'Customer',  // Add customer name
  },
  receipt_email: user.email,  // Stripe will also send a receipt
});
```

### Step 3: Test the Integration

#### 1. Start Both Functions

Terminal 1:
```bash
supabase functions serve stripe-webhook --env-file .env.local --no-verify-jwt
```

Terminal 2:
```bash
supabase functions serve create-payment-intent --env-file .env.local --no-verify-jwt
```

#### 2. Set Up Stripe CLI

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

Copy the webhook signing secret and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. Create Test Payment

```bash
JWT=$(node get-test-jwt.js)

curl -X POST 'http://127.0.0.1:54321/functions/v1/create-payment-intent' \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 2999,
    "currency": "usd"
  }'
```

#### 4. Complete Payment

Use the test card in your frontend:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

#### 5. Verify Email Sent

Check:
1. Stripe CLI shows webhook received
2. Function logs show email sent
3. Your inbox has the confirmation email
4. Resend dashboard shows email delivered

## Environment Variables

Make sure all these are set in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@resend.dev
```

## Database Schema

Add email tracking to payments table:

```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Update webhook to set these fields
UPDATE payments 
SET 
  email_sent = TRUE,
  email_sent_at = NOW()
WHERE stripe_payment_intent_id = 'pi_xxx';
```

## Frontend Integration

Update your payment form to show email confirmation:

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setMessage(error.message || 'Payment failed');
    } else {
      setMessage('✅ Payment successful! Check your email for confirmation.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      {message && (
        <div className={`p-3 rounded ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <p className="text-sm text-gray-600 text-center">
        📧 You'll receive an email confirmation after payment
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const supabase = createClient();

  useEffect(() => {
    // Create payment intent
    supabase.functions.invoke('create-payment-intent', {
      body: { amount: 2999, currency: 'usd' }
    }).then(({ data }) => {
      setClientSecret(data.clientSecret);
    });
  }, []);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}
```

## Success Page

Create `app/payment-success/page.tsx`:

```typescript
export default function PaymentSuccessPage() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your payment. We've sent a confirmation email to your inbox.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-800">
          📧 Check your email for order details and receipt
        </p>
      </div>
      <a
        href="/dashboard"
        className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
```

## Monitoring

### Check Email Delivery

```sql
-- View recent payments with email status
SELECT 
  p.id,
  p.amount,
  p.status,
  p.email_sent,
  p.email_sent_at,
  el.email_id as resend_email_id,
  el.status as email_status
FROM payments p
LEFT JOIN email_logs el ON el.to = p.user_email
WHERE p.created_at > NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC;
```

### Dashboard Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PaymentEmailDashboard() {
  const [stats, setStats] = useState({
    totalPayments: 0,
    emailsSent: 0,
    emailsFailed: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: payments } = await supabase
      .from('payments')
      .select('email_sent')
      .eq('status', 'succeeded');

    if (payments) {
      setStats({
        totalPayments: payments.length,
        emailsSent: payments.filter(p => p.email_sent).length,
        emailsFailed: payments.filter(p => !p.email_sent).length,
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-3xl font-bold">{stats.totalPayments}</div>
        <div className="text-gray-600">Total Payments</div>
      </div>
      <div className="bg-green-50 p-6 rounded-lg shadow">
        <div className="text-3xl font-bold text-green-600">{stats.emailsSent}</div>
        <div className="text-gray-600">Emails Sent</div>
      </div>
      <div className="bg-red-50 p-6 rounded-lg shadow">
        <div className="text-3xl font-bold text-red-600">{stats.emailsFailed}</div>
        <div className="text-gray-600">Emails Failed</div>
      </div>
    </div>
  );
}
```

## Error Handling

### Retry Failed Emails

```typescript
// Create a function to retry failed emails
async function retryFailedEmails() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get payments without emails sent
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'succeeded')
    .eq('email_sent', false)
    .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes old

  for (const payment of payments || []) {
    try {
      await sendOrderConfirmationEmail({
        email: payment.user_email,
        name: payment.user_name,
        orderId: payment.stripe_payment_intent_id,
        amount: payment.amount / 100,
        currency: payment.currency,
      });

      await supabase
        .from('payments')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('id', payment.id);

    } catch (error) {
      console.error(`Failed to send email for payment ${payment.id}:`, error);
    }
  }
}
```

## Best Practices

1. **Don't fail webhooks on email errors** - Log the error but return 200
2. **Include customer email in metadata** - Makes it available in webhooks
3. **Use receipt_email** - Stripe sends its own receipt too
4. **Log all emails** - Track delivery for debugging
5. **Retry failed emails** - Create a scheduled job to retry
6. **Test thoroughly** - Use Stripe test mode and Resend test emails
7. **Monitor delivery** - Check Resend dashboard regularly

## Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY is set in webhook function
- Verify customer email is in payment intent metadata
- Check webhook logs for errors

**Webhook not triggering?**
- Verify Stripe CLI is running
- Check webhook secret is correct
- Ensure webhook endpoint is accessible

**Wrong email content?**
- Check payment intent metadata has correct data
- Verify template generation function
- Test email template separately

## Next Steps

1. ✅ Implement Stripe + Email integration
2. 📊 Add email delivery monitoring
3. 🔄 Create retry mechanism for failed emails
4. 📧 Add more email templates (refund, shipping, etc.)
5. 🎨 Customize email designs
6. 📈 Track email open rates (Challenge 4)

---

**Integration Complete!** 🎉 Your users now receive beautiful email confirmations after successful payments.
