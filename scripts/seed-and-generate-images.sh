#!/bin/bash

# Seed products and generate images
# This script runs both the seeding and image generation in sequence

echo "🌱 Step 1: Seeding products..."
npx tsx scripts/seed-more-products.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "📸 Step 2: Generating product images..."
  node scripts/create-missing-images.js
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✨ All done! Products seeded and images generated."
    echo "Visit http://localhost:3000/products to see the results."
  else
    echo "❌ Image generation failed"
    exit 1
  fi
else
  echo "❌ Product seeding failed"
  exit 1
fi
