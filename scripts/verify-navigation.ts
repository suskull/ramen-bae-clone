/**
 * Navigation Verification Script
 * 
 * This script verifies that all main navigation routes are properly configured
 * and that pages exist for all links in the navigation and footer.
 */

import fs from 'fs';
import path from 'path';

interface RouteCheck {
  path: string;
  description: string;
  exists: boolean;
  filePath?: string;
}

const routes: RouteCheck[] = [
  // Main navigation routes
  { path: '/', description: 'Homepage', exists: false },
  { path: '/products', description: 'Products listing', exists: false },
  { path: '/about', description: 'About Us page', exists: false },
  { path: '/faq', description: 'FAQ page', exists: false },
  { path: '/contact', description: 'Contact page', exists: false },
  
  // Auth routes
  { path: '/profile', description: 'User profile', exists: false },
  { path: '/signup', description: 'Sign up page', exists: false },
  { path: '/forgot-password', description: 'Forgot password', exists: false },
  { path: '/reset-password', description: 'Reset password', exists: false },
  
  // Footer routes
  { path: '/shipping', description: 'Shipping info', exists: false },
  { path: '/returns', description: 'Returns policy', exists: false },
  { path: '/privacy', description: 'Privacy policy', exists: false },
  { path: '/terms', description: 'Terms of service', exists: false },
  { path: '/cookies', description: 'Cookie policy', exists: false },
];

function checkRouteExists(route: string): { exists: boolean; filePath?: string } {
  const appDir = path.join(process.cwd(), 'src', 'app');
  
  // Handle root route
  if (route === '/') {
    const pagePath = path.join(appDir, 'page.tsx');
    return { exists: fs.existsSync(pagePath), filePath: pagePath };
  }
  
  // Remove leading slash and split path
  const routeParts = route.slice(1).split('/');
  const routeDir = path.join(appDir, ...routeParts);
  
  // Check for page.tsx in the route directory
  const pagePath = path.join(routeDir, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    return { exists: true, filePath: pagePath };
  }
  
  // Check for page.js
  const pageJsPath = path.join(routeDir, 'page.js');
  if (fs.existsSync(pageJsPath)) {
    return { exists: true, filePath: pageJsPath };
  }
  
  return { exists: false };
}

function verifyNavigation() {
  console.log('🔍 Verifying Navigation Routes...\n');
  
  let allRoutesExist = true;
  
  routes.forEach(route => {
    const result = checkRouteExists(route.path);
    route.exists = result.exists;
    route.filePath = result.filePath;
    
    const status = route.exists ? '✅' : '❌';
    console.log(`${status} ${route.path.padEnd(25)} - ${route.description}`);
    
    if (!route.exists) {
      allRoutesExist = false;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (allRoutesExist) {
    console.log('✅ All navigation routes exist!');
  } else {
    console.log('❌ Some routes are missing. Please create the missing pages.');
    const missingRoutes = routes.filter(r => !r.exists);
    console.log('\nMissing routes:');
    missingRoutes.forEach(r => {
      console.log(`  - ${r.path} (${r.description})`);
    });
  }
  
  console.log('='.repeat(60) + '\n');
  
  return allRoutesExist;
}

// Run verification
const success = verifyNavigation();
process.exit(success ? 0 : 1);
