#!/bin/bash

# Test script for send-email Edge Function
# Tests email sending with different templates

set -e

echo "🧪 Testing Send Email Edge Function"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

# Load environment variables
source .env.local

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# Get JWT token for testing
echo "🔑 Getting JWT token..."
JWT_TOKEN=$(node get-test-jwt.js 2>/dev/null || echo "")

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Error: Failed to get JWT token"
    echo "Make sure you have a test user created and get-test-jwt.js is configured"
    exit 1
fi

echo "✅ JWT token obtained"
echo ""

# Function URL
FUNCTION_URL="http://127.0.0.1:54321/functions/v1/send-email"

# Test 1: Welcome Email Template
echo "📧 Test 1: Sending welcome email..."
RESPONSE=$(curl -s -w "\n%{http_code}" --location --request POST "$FUNCTION_URL" \
  --header "Authorization: Bearer $JWT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "subject": "Welcome!",
    "template": "welcome",
    "templateData": {
      "name": "John Doe",
      "dashboardUrl": "https://yourapp.com/dashboard"
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Welcome email sent successfully"
    echo "Response: $BODY"
else
    echo "❌ Failed with status $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Order Confirmation Template
echo "📧 Test 2: Sending order confirmation..."
RESPONSE=$(curl -s -w "\n%{http_code}" --location --request POST "$FUNCTION_URL" \
  --header "Authorization: Bearer $JWT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "subject": "Order Confirmation",
    "template": "order-confirmation",
    "templateData": {
      "name": "Jane Smith",
      "orderId": "ORD-12345",
      "total": 99.99,
      "items": [
        { "name": "Product A", "quantity": 2, "price": 29.99 },
        { "name": "Product B", "quantity": 1, "price": 39.99 }
      ]
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Order confirmation sent successfully"
    echo "Response: $BODY"
else
    echo "❌ Failed with status $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Custom HTML Email
echo "📧 Test 3: Sending custom HTML email..."
RESPONSE=$(curl -s -w "\n%{http_code}" --location --request POST "$FUNCTION_URL" \
  --header "Authorization: Bearer $JWT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "subject": "Custom Email Test",
    "html": "<h1>Hello!</h1><p>This is a <strong>custom</strong> HTML email.</p>",
    "text": "Hello! This is a custom HTML email."
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Custom HTML email sent successfully"
    echo "Response: $BODY"
else
    echo "❌ Failed with status $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 4: Multiple Recipients
echo "📧 Test 4: Sending to multiple recipients..."
RESPONSE=$(curl -s -w "\n%{http_code}" --location --request POST "$FUNCTION_URL" \
  --header "Authorization: Bearer $JWT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "to": ["test1@example.com", "test2@example.com"],
    "subject": "Team Notification",
    "html": "<p>This email is sent to multiple recipients.</p>",
    "cc": "manager@example.com"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Multi-recipient email sent successfully"
    echo "Response: $BODY"
else
    echo "❌ Failed with status $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 5: Error Handling - Missing Required Fields
echo "📧 Test 5: Testing error handling (missing subject)..."
RESPONSE=$(curl -s -w "\n%{http_code}" --location --request POST "$FUNCTION_URL" \
  --header "Authorization: Bearer $JWT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "to": "test@example.com",
    "html": "<p>Email without subject</p>"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
    echo "✅ Error handling works correctly"
    echo "Response: $BODY"
else
    echo "⚠️  Expected 400 status, got $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

echo "===================================="
echo "✅ All tests completed!"
echo ""
echo "💡 Tips:"
echo "  - Check your email inbox for test emails"
echo "  - If using Resend test mode, emails go to onboarding@resend.dev"
echo "  - For production, verify your domain in Resend dashboard"
echo "  - Check Edge Function logs: supabase functions logs send-email"
