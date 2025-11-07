#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create placeholder SVG images for products
const createPlaceholderSVG = (width, height, text, color = '#fe90b8') => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}" opacity="0.1"/>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="${color}" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
};

const productsDir = path.join(__dirname, '../public/products');

// Required images from the API
const requiredImages = [
  'chili-oil-1.svg',
  'chili-oil-2.svg', 
  'garlic-1.svg',
  'garlic-2.svg',
  'nori-1.svg',
  'nori-2.svg',
  'sesame-1.svg',
  'sesame-2.svg',
  'spicy-mix-1.svg',
  'spicy-mix-2.svg',
  'starter-bundle-1.svg',
  'starter-bundle-2.svg',
  'tshirt-1.svg',
  'tshirt-2.svg',
  'ultimate-mix-1.svg',
  'ultimate-mix-2.svg',
  'umami-1.svg',
  'umami-2.svg'
];

// Generate missing images
requiredImages.forEach(imageName => {
  const imagePath = path.join(productsDir, imageName);
  
  if (!fs.existsSync(imagePath)) {
    const productName = imageName.replace(/-\d+\.svg$/, '').replace(/-/g, ' ').toUpperCase();
    const isHover = imageName.includes('-2.');
    const text = isHover ? `${productName}\n(HOVER)` : productName;
    
    const svg = createPlaceholderSVG(400, 400, text);
    
    fs.writeFileSync(imagePath, svg);
    console.log(`Created: ${imagePath}`);
  } else {
    console.log(`Exists: ${imagePath}`);
  }
});

console.log('Done!');