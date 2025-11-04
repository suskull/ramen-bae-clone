#!/bin/bash

# Get JWT token
JWT=$(node get-test-jwt.js 2>&1 | tail -1 | cut -d' ' -f3)

echo "Testing updated payment intent function..."
echo ""

# Test the payment intent creation
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-payment-intent' \
  --header "Authorization: Bearer $JWT" \
  --header 'Content-Type: application/json' \
  --data '{
    "amount": 29.99,
    "currency": "usd",
    "orderId": "test_order_001",
    "description": "Test payment with updated CORS utility"
  }'

echo ""
echo ""
echo "Test completed!"
