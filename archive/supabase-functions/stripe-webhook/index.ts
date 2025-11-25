import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  console.log(`🎣 Webhook received: ${req.method}`);

  try {
    // Get webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`✅ Webhook verified: ${event.type} (${event.id})`);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
        console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
        console.log(`   Customer: ${paymentIntent.metadata.email}`);
        console.log(`   Order ID: ${paymentIntent.metadata.orderId}`);

        // In a real app, you would update your database here
        // Example: Update order status, send confirmation email, etc.

        const logData = {
          event_type: 'payment_succeeded',
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customer_email: paymentIntent.metadata.email,
          order_id: paymentIntent.metadata.orderId,
          user_id: paymentIntent.metadata.userId,
          processed_at: new Date().toISOString(),
        };

        console.log('📊 Payment data:', JSON.stringify(logData, null, 2));
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        console.log(`   Error: ${paymentIntent.last_payment_error?.message}`);
        console.log(`   Code: ${paymentIntent.last_payment_error?.code}`);

        const errorData = {
          event_type: 'payment_failed',
          payment_intent_id: paymentIntent.id,
          error_message: paymentIntent.last_payment_error?.message,
          error_code: paymentIntent.last_payment_error?.code,
          customer_email: paymentIntent.metadata.email,
          order_id: paymentIntent.metadata.orderId,
          failed_at: new Date().toISOString(),
        };

        console.log('📊 Payment failure data:', JSON.stringify(errorData, null, 2));
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`⚠️  Payment requires action: ${paymentIntent.id}`);
        console.log(`   Next action: ${paymentIntent.next_action?.type}`);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
        console.log(`   Cancellation reason: ${paymentIntent.cancellation_reason}`);
        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event: event.type }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);

    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('❌ Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
