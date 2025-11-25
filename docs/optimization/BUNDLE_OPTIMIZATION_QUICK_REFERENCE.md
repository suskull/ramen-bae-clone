# Bundle Optimization Quick Reference

## Quick Commands

### Analyze Bundle Size
```bash
pnpm run analyze
```
Opens interactive bundle visualization in your browser.

### Build for Production
```bash
pnpm run build
```
Creates optimized production build.

### Test Production Build
```bash
pnpm run build && pnpm run start
```
Build and run production server locally.

## What Was Optimized

### ✅ Automatic Optimizations (No Code Changes Needed)
- Icon library tree-shaking (lucide-react)
- Date utility tree-shaking (date-fns)
- Radix UI component optimization
- Framer Motion optimization
- Console log removal in production
- React Query devtools excluded from production

### ✅ Manual Optimizations (Code Changes)
- Dynamic imports for RelatedProducts component
- Dynamic imports for ReviewForm component
- Conditional React Query devtools loading

## Estimated Savings
**Total: 305-660KB** reduction in bundle size

## Key Files Modified

1. `next.config.ts` - Bundle analyzer and optimization config
2. `package.json` - Added analyze script
3. `src/providers/query-provider.tsx` - Conditional devtools
4. `src/components/product/ProductDetailLayout.tsx` - Dynamic imports

## Best Practices

### ✅ DO
```typescript
// Specific imports
import { Star, ShoppingCart } from 'lucide-react'

// Dynamic imports for heavy components
const Heavy = dynamic(() => import('./Heavy'))

// Conditional dev tools
const DevTools = process.env.NODE_ENV === 'development' 
  ? require('./DevTools').default 
  : () => null
```

### ❌ DON'T
```typescript
// Entire library imports
import * as Icons from 'lucide-react'

// Always importing heavy components
import Heavy from './Heavy'

// Always including dev tools
import DevTools from './DevTools'
```

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| First Load JS | < 200KB | ✅ |
| Route JS | < 50KB | ✅ |
| Lighthouse Score | > 90 | 🎯 |
| LCP | < 2.5s | 🎯 |
| FCP | < 1.8s | 🎯 |

## When to Check Bundle Size

- ✅ Before adding new dependencies
- ✅ After major feature additions
- ✅ Before production releases
- ✅ Weekly during active development

## Resources

- [Full Documentation](./docs/BUNDLE_OPTIMIZATION.md)
- [Summary Report](./docs/BUNDLE_OPTIMIZATION_SUMMARY.md)
- [Next.js Optimization Docs](https://nextjs.org/docs/app/building-your-application/optimizing)

## Quick Troubleshooting

### Bundle Too Large?
1. Run `pnpm run analyze`
2. Identify largest packages
3. Check for duplicate dependencies
4. Review imports for tree-shaking

### Slow Build?
1. Check TypeScript config
2. Review dependencies
3. Ensure `.next/cache` is preserved

### Performance Issues?
1. Run Lighthouse audit
2. Check bundle size
3. Review code splitting
4. Optimize images

---

**Last Updated**: Task 13.3 Implementation
**Next Review**: Before production deployment
