#!/bin/bash

echo "🧪 Testing Local Stripe Webhook"
echo "================================"
echo ""

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed!"
    echo "   Install: brew install stripe/stripe-cli/stripe"
    exit 1
fi

echo "✅ Stripe CLI is installed"
echo ""

# Check if local Edge Function is running
if curl -s http://localhost:54321/functions/v1/stripe-webhook > /dev/null 2>&1; then
    echo "✅ Webhook function is running locally"
else
    echo "❌ Webhook function is NOT running!"
    echo "   Start it: supabase functions serve stripe-webhook --env-file .env.local"
    exit 1
fi

echo ""
echo "📋 Instructions:"
echo "   1. In a NEW terminal, run:"
echo "      stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook"
echo ""
echo "   2. Copy the webhook secret (whsec_...) from the output"
echo ""
echo "   3. Add it to .env.local:"
echo "      STRIPE_WEBHOOK_SECRET=whsec_your_secret_here"
echo ""
echo "   4. Restart the webhook function"
echo ""
echo "   5. In ANOTHER terminal, trigger an event:"
echo "      stripe trigger payment_intent.succeeded"
echo ""
echo "   6. Check the logs in both terminals!"
echo ""
