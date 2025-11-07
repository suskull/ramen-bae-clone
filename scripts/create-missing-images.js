#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Color palette for different categories
const categoryColors = {
  'mixes': '#fe90b8',
  'single-toppings': '#96da2f',
  'bundles': '#FFB6C1',
  'seasoning-and-sauce': '#ff4100',
  'merch': '#87CEEB',
};

// Create placeholder SVG images for products
const createPlaceholderSVG = (width, height, text, color = '#fe90b8', isHover = false) => {
  const bgOpacity = isHover ? '0.15' : '0.1';
  const strokeWidth = isHover ? '3' : '2';
  const fontSize = text.length > 20 ? '12' : '14';
  
  // Split text into multiple lines if too long
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > 20 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  const lineHeight = 18;
  const startY = 50 - ((lines.length - 1) * lineHeight / 2);
  
  const textElements = lines.map((line, i) => 
    `<text x="50%" y="${startY + i * lineHeight}%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${color}" text-anchor="middle" dominant-baseline="middle">${line}</text>`
  ).join('\n  ');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}" opacity="${bgOpacity}"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="5,5"/>
  ${textElements}
  ${isHover ? `<circle cx="90%" cy="10%" r="8" fill="${color}" opacity="0.3"/>` : ''}
</svg>`;
};

async function generateProductImages() {
  console.log('Fetching products from Supabase...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, name, images, category:categories(slug), accent_color');
  
  if (error) {
    console.error('❌ Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products`);
  
  const publicDir = path.join(__dirname, '../public/products');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`Created directory: ${publicDir}`);
  }

  const updates = [];
  
  for (const product of products) {
    const categorySlug = product.category?.slug || 'default';
    const color = product.accent_color || categoryColors[categorySlug] || '#fe90b8';
    const images = product.images || [];
    
    // Generate main and hover images
    const mainImagePath = `/products/${product.slug}-1.svg`;
    const hoverImagePath = `/products/${product.slug}-2.svg`;
    
    const mainImageFile = path.join(publicDir, `${product.slug}-1.svg`);
    const hoverImageFile = path.join(publicDir, `${product.slug}-2.svg`);
    
    // Create main image
    if (!fs.existsSync(mainImageFile)) {
      const svg = createPlaceholderSVG(400, 400, product.name, color, false);
      fs.writeFileSync(mainImageFile, svg);
      console.log(`✅ Created: ${mainImageFile}`);
    }
    
    // Create hover image
    if (!fs.existsSync(hoverImageFile)) {
      const svg = createPlaceholderSVG(400, 400, product.name, color, true);
      fs.writeFileSync(hoverImageFile, svg);
      console.log(`✅ Created: ${hoverImageFile}`);
    }
    
    // Update product images in database if needed
    const needsUpdate = images.length === 0 || 
                       !images.some(img => img.url === mainImagePath) ||
                       !images.some(img => img.url === hoverImagePath);
    
    if (needsUpdate) {
      updates.push({
        id: product.id,
        images: [
          { url: mainImagePath, alt: `${product.name} main`, type: 'main' },
          { url: hoverImagePath, alt: `${product.name} hover`, type: 'hover' }
        ]
      });
    }
  }
  
  // Batch update products with new image paths
  if (updates.length > 0) {
    console.log(`\nUpdating ${updates.length} products with new image paths...`);
    
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: update.images })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`❌ Error updating product ${update.id}:`, updateError);
      } else {
        console.log(`✅ Updated product ${update.id}`);
      }
    }
  }
  
  console.log('\n✨ Done! All product images created and database updated.');
}

generateProductImages().catch(console.error);
