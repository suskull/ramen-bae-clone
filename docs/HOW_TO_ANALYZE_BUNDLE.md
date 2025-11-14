# How to Analyze Bundle Size

## The Issue with Next.js 16 + Turbopack

Next.js 16 uses Turbopack by default for faster builds, but:

1. **No bundle size info**: Turbopack doesn't show bundle sizes in terminal
2. **No bundle analyzer support**: `@next/bundle-analyzer` only works with webpack
3. **No visualization**: Can't generate interactive bundle treemaps

**Solution**: Use webpack mode with the `--webpack` flag for analysis.

## Solution: Use Webpack Mode for Analysis

All analyze commands now automatically use `--webpack` flag.

### Option 1: Analyze Both Client and Server (Recommended)

```bash
pnpm run analyze
```

This will:
- Build using webpack (not Turbopack) for accurate analysis
- Generate HTML reports for both client and server bundles
- Automatically open browser tabs with the visualizations

**Wait for the build to complete** - it may take 30-60 seconds longer than a normal build.

### Option 2: Analyze Client Bundle Only

```bash
pnpm run analyze:browser
```

Focuses only on the client-side JavaScript bundle (what users download).

### Option 3: Analyze Server Bundle Only

```bash
pnpm run analyze:server
```

Focuses only on the server-side bundle.

## If Browser Doesn't Auto-Open

If the browser doesn't automatically open, the HTML files are saved in your project. Open them manually:

### On macOS:
```bash
open .next/analyze/client.html
open .next/analyze/server.html
```

### On Linux:
```bash
xdg-open .next/analyze/client.html
xdg-open .next/analyze/server.html
```

### On Windows:
```bash
start .next/analyze/client.html
start .next/analyze/server.html
```

Or simply navigate to `.next/analyze/` in your file explorer and double-click the HTML files.

## What to Look For

### 1. Large Dependencies (Red/Orange Boxes)

Look for packages that take up significant space:
- **> 100KB**: Consider alternatives or lazy loading
- **> 50KB**: Review if all features are needed
- **> 200KB**: Definitely needs optimization

### 2. Duplicate Dependencies

If you see the same package multiple times:
- Check for version conflicts
- Review your package.json
- Consider using pnpm's resolution feature

### 3. Unused Code

Large packages where you only use a few features:
- Ensure tree-shaking is working
- Use specific imports instead of barrel imports
- Consider dynamic imports

### 4. First Load JS

The total size of JavaScript needed for the initial page load:
- **Target**: < 200KB (gzipped)
- **Good**: 200-300KB
- **Needs Work**: > 300KB

## Example Analysis

After running `pnpm run analyze`, you'll see an interactive treemap like this:

```
┌─────────────────────────────────────────────┐
│  Client Bundle (client.html)                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌────────┐  ┌────────┐ │
│  │ react-dom    │  │ next   │  │ your   │ │
│  │ 130KB        │  │ 80KB   │  │ code   │ │
│  └──────────────┘  └────────┘  │ 50KB   │ │
│                                 └────────┘ │
│  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │ icons│  │ utils│  │ other│            │
│  │ 40KB │  │ 30KB │  │ 20KB │            │
│  └──────┘  └──────┘  └──────┘            │
│                                             │
│  Total: ~350KB (uncompressed)              │
│  Gzipped: ~120KB                           │
└─────────────────────────────────────────────┘
```

### Interactive Features

- **Click boxes** to zoom in and see details
- **Hover** to see exact sizes
- **Right-click** to zoom out
- **Search** for specific packages

## Quick Size Check Without Full Analysis

If you just want to see bundle sizes quickly (without full visualization):

```bash
pnpm run build:webpack
```

**Note**: Use `build:webpack` not `build`. Regular `pnpm run build` uses Turbopack which doesn't show sizes.

The webpack build output shows route sizes:

```
Route (app)                              Size     First Load JS
┌ ○ /                                   5 kB        150 kB
├ ○ /products                           8 kB        153 kB
└ ƒ /products/[slug]                   12 kB        157 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## Troubleshooting

### "No analyze directory found"

**Cause**: Build didn't complete or Turbopack was used

**Solution**: 
```bash
# Make sure to use --no-turbopack flag
pnpm run analyze
```

### "Browser didn't open"

**Cause**: System might not have default browser set or auto-open is disabled

**Solution**: Manually open the files:
```bash
open .next/analyze/client.html
```

### "Build takes too long"

**Cause**: Webpack mode is slower than Turbopack

**Solution**: This is normal. Analysis builds take longer because:
- Webpack is slower than Turbopack
- Bundle analyzer adds processing time
- Full optimization is applied

**Tip**: Only run analysis when needed, not on every build.

### "Out of memory error"

**Cause**: Large project with limited Node.js memory

**Solution**: Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm run analyze
```

## Best Practices

### When to Analyze

✅ **Do analyze**:
- Before adding new large dependencies
- After major feature additions
- Before production releases
- When investigating performance issues
- Weekly during active development

❌ **Don't analyze**:
- On every build (too slow)
- During rapid development iterations
- When you just need to test functionality

### What to Optimize First

1. **Largest packages** (> 100KB)
2. **Duplicate dependencies**
3. **Unused code** in large packages
4. **Development-only code** in production
5. **Heavy components** that could be lazy-loaded

### Setting Up Alerts

Consider adding bundle size checks to your CI/CD:

```json
// package.json
{
  "scripts": {
    "check-size": "size-limit"
  }
}
```

Install size-limit:
```bash
pnpm add -D size-limit @size-limit/preset-app
```

## Alternative Tools

If bundle analyzer doesn't work well, try these alternatives:

### 1. Next.js Build Output
```bash
pnpm run build
# Shows route sizes in terminal
```

### 2. Webpack Bundle Analyzer (Manual)
```bash
pnpm add -D webpack-bundle-analyzer
# Configure manually in next.config.ts
```

### 3. Source Map Explorer
```bash
pnpm add -D source-map-explorer
pnpm run build
source-map-explorer '.next/static/chunks/*.js'
```

### 4. Bundle Phobia (Online)
Check package sizes before installing:
- Visit: https://bundlephobia.com
- Search for package name
- See size impact before adding to project

## Summary

**Quick Check**: `pnpm run build` (shows sizes in terminal)

**Full Analysis**: `pnpm run analyze` (opens interactive visualization)

**Manual Access**: Open `.next/analyze/client.html` in browser

**Target**: Keep First Load JS under 200KB (gzipped)

**Optimize**: Focus on packages > 100KB first

---

**Note**: Bundle analysis uses webpack mode which is slower but more accurate than Turbopack. This is temporary until Next.js 16 fully supports bundle analysis with Turbopack.
