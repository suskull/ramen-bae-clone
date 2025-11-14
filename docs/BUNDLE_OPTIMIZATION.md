# Bundle Size Optimization Guide

## Overview

This document outlines the bundle optimization strategies implemented for the Ramen Bae e-commerce application to ensure fast load times and optimal performance.

## Implemented Optimizations

### 1. Bundle Analyzer Setup

**Tool**: `@next/bundle-analyzer`

**Usage**:
```bash
pnpm run analyze
```

This will build the application and open interactive visualizations showing:
- Bundle composition by package
- Largest dependencies
- Code splitting effectiveness
- Duplicate dependencies

### 2. Next.js Configuration Optimizations

#### React Strict Mode
```typescript
reactStrictMode: true
```
Enables additional development checks and warnings.

#### SWC Minification
```typescript
swcMinify: true
```
Uses the faster Rust-based SWC compiler for minification instead of Terser.

#### Console Log Removal
```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
}
```
Automatically removes console.log statements in production while keeping error and warn logs.

### 3. Module Import Optimizations

#### Lucide React Icons
```typescript
modularizeImports: {
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    skipDefaultConversion: true,
  },
}
```
**Impact**: Only imports the specific icons used, not the entire icon library.
**Savings**: ~500KB+ depending on icon usage

#### Date-fns
```typescript
modularizeImports: {
  'date-fns': {
    transform: 'date-fns/{{member}}',
  },
}
```
**Impact**: Tree-shakes unused date-fns functions.
**Savings**: ~100KB+ depending on function usage

### 4. Package Import Optimization

```typescript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'date-fns',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    'framer-motion',
  ],
}
```

This experimental feature automatically optimizes imports from these packages by:
- Removing unused exports
- Improving tree-shaking
- Reducing bundle size

### 5. Code Splitting Strategy

#### Automatic Route-Based Splitting
Next.js automatically splits code by route. Each page only loads the JavaScript it needs.

#### Dynamic Imports
For heavy components that aren't immediately needed:

```typescript
// Example: Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Optional: disable SSR for client-only components
});
```

**Recommended for**:
- Modal content
- Chart libraries
- Rich text editors
- Image galleries with zoom

### 6. Third-Party Library Optimizations

#### Current Dependencies Analysis

**Large Dependencies** (potential optimization targets):
- `framer-motion` (~100KB): Used for animations
  - ✅ Already optimized via `optimizePackageImports`
  - Consider: Use CSS animations for simple transitions
  
- `@tanstack/react-query` (~50KB): Data fetching and caching
  - ✅ Essential for the application
  - No optimization needed
  
- `@supabase/supabase-js` (~80KB): Backend client
  - ✅ Essential for the application
  - No optimization needed
  
- `lucide-react` (~500KB unoptimized): Icon library
  - ✅ Optimized via `modularizeImports`
  - Only used icons are bundled

#### Optimization Recommendations

1. **Framer Motion**: Consider replacing simple animations with CSS
   ```css
   /* Instead of framer-motion for simple fades */
   .fade-in {
     animation: fadeIn 0.3s ease-in-out;
   }
   ```

2. **React Query Devtools**: Already in devDependencies (good!)
   ```typescript
   // Only load in development
   const ReactQueryDevtools = 
     process.env.NODE_ENV === 'development'
       ? require('@tanstack/react-query-devtools').ReactQueryDevtools
       : () => null;
   ```

3. **Zustand**: Already minimal (~3KB)

### 7. Image Optimization

Already implemented in `next.config.ts`:
- WebP format with automatic fallbacks
- Responsive image sizes
- Lazy loading for below-the-fold images
- Proper caching headers

### 8. Font Optimization

Using Next.js font optimization:
```typescript
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
```

**Benefits**:
- Self-hosted fonts (no external requests)
- Automatic font subsetting
- Font display swap for better performance

## Performance Targets

### Bundle Size Goals
- **First Load JS**: < 200KB (gzipped)
- **Route JS**: < 50KB per route (gzipped)
- **Shared JS**: < 100KB (gzipped)

### Performance Metrics
- **Lighthouse Performance**: > 90
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 300ms

## Monitoring and Analysis

### 1. Run Bundle Analysis
```bash
pnpm run analyze
```

### 2. Check Build Output
```bash
pnpm run build
```

Look for:
- Route sizes
- First Load JS shared by all
- Warnings about large page bundles

### 3. Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

### 4. Bundle Size Tracking

Consider adding bundle size tracking to CI/CD:
```bash
# Install bundlesize
pnpm add -D bundlesize

# Add to package.json
"bundlesize": [
  {
    "path": ".next/static/chunks/*.js",
    "maxSize": "200kb"
  }
]
```

## Best Practices

### Import Optimization
✅ **Do**: Import specific functions
```typescript
import { formatDistanceToNow } from 'date-fns';
import { Star, ShoppingCart } from 'lucide-react';
```

❌ **Don't**: Import entire libraries
```typescript
import * as dateFns from 'date-fns';
import * as Icons from 'lucide-react';
```

### Dynamic Imports
✅ **Do**: Lazy load heavy components
```typescript
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

❌ **Don't**: Import everything upfront
```typescript
import Chart from './Chart'; // If Chart is heavy and not immediately needed
```

### Component Splitting
✅ **Do**: Split large components
```typescript
// Separate modal content into its own component
const ModalContent = dynamic(() => import('./ModalContent'));
```

### Tree Shaking
✅ **Do**: Use ES modules
```typescript
export const myFunction = () => {};
```

❌ **Don't**: Use CommonJS
```typescript
module.exports = { myFunction };
```

## Troubleshooting

### Large Bundle Size

1. **Run bundle analyzer**: `pnpm run analyze`
2. **Identify large dependencies**: Look for packages > 50KB
3. **Check for duplicates**: Multiple versions of the same package
4. **Review imports**: Ensure tree-shaking is working

### Slow Build Times

1. **Check TypeScript**: Ensure `incremental: true` in tsconfig.json
2. **Review dependencies**: Remove unused packages
3. **Use SWC**: Already enabled in next.config.ts
4. **Cache**: Ensure `.next/cache` is preserved in CI/CD

### Runtime Performance Issues

1. **Check bundle size**: Large bundles = slow load times
2. **Review code splitting**: Ensure routes are properly split
3. **Optimize images**: Use Next.js Image component
4. **Lazy load**: Use dynamic imports for heavy components

## Future Optimizations

### Potential Improvements

1. **Implement Progressive Web App (PWA)**
   - Service worker for offline support
   - App shell caching
   - Background sync

2. **Add Preloading**
   ```typescript
   <link rel="preload" href="/fonts/poppins.woff2" as="font" />
   ```

3. **Implement Route Prefetching**
   ```typescript
   <Link href="/products" prefetch={true}>
   ```

4. **Consider Module Federation**
   - For micro-frontend architecture
   - Share dependencies across apps

5. **Optimize Third-Party Scripts**
   ```typescript
   import Script from 'next/script';
   
   <Script
     src="https://analytics.example.com"
     strategy="lazyOnload"
   />
   ```

## Resources

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Optimization Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Phobia](https://bundlephobia.com/) - Check package sizes before installing

## Conclusion

The implemented optimizations focus on:
1. **Automatic tree-shaking** for icon libraries and utilities
2. **Code splitting** by route and component
3. **Minification** using SWC compiler
4. **Image optimization** with Next.js Image component
5. **Font optimization** with Next.js font loading

These optimizations should result in:
- Faster initial page loads
- Smaller bundle sizes
- Better Core Web Vitals scores
- Improved user experience

Run `pnpm run analyze` regularly to monitor bundle size and identify optimization opportunities.
