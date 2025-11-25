import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { handleCors, createCorsResponse } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  console.log(`🚀 Payment Intent function called with method: ${req.method}`);

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log('✅ Preflight request handled, returning CORS headers');
    return corsResponse;
  }

  const origin = req.headers.get('origin');

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('❌ Unauthorized: No user found');
      return createCorsResponse(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 },
        origin
      );
    }

    console.log(`✅ Authenticated user: ${user.id} (${user.email})`);

    // Parse request body
    const { amount, currency = 'usd', orderId, description } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      console.log(`❌ Invalid amount: ${amount}`);
      return createCorsResponse(
        { error: 'Invalid amount', message: 'Amount must be greater than 0' },
        { status: 400 },
        origin
      );
    }

    console.log(`💰 Creating payment intent for $${amount} ${currency}`);

    // Create payment intent with enhanced metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || `Payment for order ${orderId || 'N/A'}`,
      metadata: {
        userId: user.id,
        orderId: orderId || `order_${Date.now()}`,
        email: user.email || '',
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: user.email || undefined,
      statement_descriptor: 'RAMEN BAE',
    });

    console.log(`✅ Payment Intent created: ${paymentIntent.id}`);

    // Return client secret and payment intent details
    return createCorsResponse(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      { status: 200 },
      origin
    );

  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    
    // Enhanced error handling for Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`Stripe Error Type: ${error.type}, Code: ${error.code}`);
      return createCorsResponse(
        { 
          error: 'Payment processing failed',
          message: error.message,
          details: {
            type: error.type,
            code: error.code,
            decline_code: error.decline_code,
          },
        },
        { status: 400 },
        origin
      );
    }
    
    return createCorsResponse(
      { 
        error: 'Payment processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
      origin
    );
  }
});
