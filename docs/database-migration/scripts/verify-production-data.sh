#!/bin/bash

echo "🔍 Verifying Production Data..."
echo ""

# Check if app is using production
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | grep -v "^#" | cut -d'=' -f2)
echo "📡 Current Supabase URL: $SUPABASE_URL"
echo ""

if [[ $SUPABASE_URL == *"127.0.0.1"* ]]; then
  echo "⚠️  WARNING: You're still using LOCAL database!"
  echo "   Switch to production in .env.local"
  echo ""
fi

# Test API endpoints
echo "📊 Testing API Endpoints..."
echo ""

echo "1️⃣  Categories:"
CATEGORIES=$(curl -s "http://localhost:3000/api/categories" | jq '.categories | length')
echo "   Found: $CATEGORIES categories"
if [ "$CATEGORIES" = "5" ]; then
  echo "   ✅ Correct count!"
else
  echo "   ❌ Expected 5, got $CATEGORIES"
fi
echo ""

echo "2️⃣  Products:"
PRODUCTS=$(curl -s "http://localhost:3000/api/products" | jq '.products | length')
echo "   Found: $PRODUCTS products"
if [ "$PRODUCTS" = "9" ]; then
  echo "   ✅ Correct count!"
else
  echo "   ❌ Expected 9, got $PRODUCTS"
fi
echo ""

echo "3️⃣  Sample Category (Mixes):"
MIXES=$(curl -s "http://localhost:3000/api/products?category=mixes" | jq '.products | length')
echo "   Found: $MIXES products in Mixes"
if [ "$MIXES" = "2" ]; then
  echo "   ✅ Correct count!"
else
  echo "   ❌ Expected 2, got $MIXES"
fi
echo ""

echo "4️⃣  Sample Product:"
PRODUCT_NAME=$(curl -s "http://localhost:3000/api/products" | jq -r '.products[0].name')
echo "   First product: $PRODUCT_NAME"
if [ ! -z "$PRODUCT_NAME" ] && [ "$PRODUCT_NAME" != "null" ]; then
  echo "   ✅ Product data looks good!"
else
  echo "   ❌ No product data found"
fi
echo ""

echo "✅ Verification complete!"
echo ""
echo "📋 Summary:"
echo "   Categories: $CATEGORIES/5"
echo "   Products: $PRODUCTS/9"
echo "   Mixes: $MIXES/2"
