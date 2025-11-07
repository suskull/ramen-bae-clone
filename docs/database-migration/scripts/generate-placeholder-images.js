#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create placeholder SVG images for products
const createPlaceholderSVG = (width, height, text, color = '#fe90b8') => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}" opacity="0.1"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${color}" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
};

const productsDir = path.join(__dirname, '../public/products');

// Ensure directory exists
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Product image names from the database
const productImages = [
  'ultimate-mix-1.jpg',
  'ultimate-mix-2.jpg',
  'spicy-mix-1.jpg', 
  'spicy-mix-2.jpg',
  'crispy-garlic-1.jpg',
  'crispy-garlic-2.jpg',
  'soft-egg-1.jpg',
  'soft-egg-2.jpg',
  'nori-sheets-1.jpg',
  'nori-sheets-2.jpg',
  'starter-bundle-1.jpg',
  'starter-bundle-2.jpg',
  'umami-1.jpg',
  'umami-2.jpg',
  'chili-oil-1.jpg',
  'chili-oil-2.jpg',
  'ramen-tee-1.jpg',
  'ramen-tee-2.jpg'
];

// Generate placeholder images
productImages.forEach(imageName => {
  const productName = imageName.replace(/-\d+\.jpg$/, '').replace(/-/g, ' ').toUpperCase();
  const isHover = imageName.includes('-2.');
  const text = isHover ? `${productName}\n(HOVER)` : productName;
  
  const svg = createPlaceholderSVG(400, 400, text);
  const outputPath = path.join(productsDir, imageName.replace('.jpg', '.svg'));
  
  fs.writeFileSync(outputPath, svg);
  console.log(`Created: ${outputPath}`);
});

console.log(`Generated ${productImages.length} placeholder images`);