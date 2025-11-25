# Quick Start: Analyze Your Bundle Now

## The Issue

Next.js 16 uses Turbopack by default, which:
1. Doesn't show bundle sizes in terminal output
2. Doesn't support `@next/bundle-analyzer`

**Solution**: Use webpack mode with the `--webpack` flag.

## Solution: Try These Steps

### Step 1: Run the Analysis (with webpack)

```bash
pnpm run analyze
```

This now uses `--webpack` flag automatically.

**Wait for it to complete** (may take 1-2 minutes - webpack is slower than Turbopack)

### Step 2: Check for Generated Files

After the build completes, check if the HTML files were created:

```bash
ls -la .next/analyze/
```

You should see:
- `client.html` - Client-side bundle visualization
- `server.html` - Server-side bundle visualization

### Step 3: Open the Files Manually

Since you're on macOS, run:

```bash
open .next/analyze/client.html
```

This will open the interactive bundle visualization in your default browser.

## Alternative: Check Build Output with Sizes

To see bundle sizes in the terminal (without full analysis):

```bash
pnpm run build:webpack
```

**Note**: Regular `pnpm run build` uses Turbopack which doesn't show sizes. Use `build:webpack` to see the route table:

```
Route (app)                              Size     First Load JS
┌ ○ /                                   5 kB        150 kB
├ ○ /products                           8 kB        153 kB
└ ƒ /products/[slug]                   12 kB        157 kB
```

The "First Load JS" column shows the total JavaScript size for each route.

### Why Two Build Commands?

- `pnpm run build` - Fast Turbopack build (for development/production)
- `pnpm run build:webpack` - Slower webpack build (shows sizes, for analysis)

## What You're Looking For

### Good Signs ✅
- First Load JS < 200KB
- No duplicate packages
- Largest packages are essential dependencies (React, Next.js)

### Red Flags 🚩
- First Load JS > 300KB
- Same package appearing multiple times
- Large packages you barely use
- Development tools in production bundle

## Current Optimizations Applied

Your bundle is already optimized with:
- ✅ Tree-shaking for lucide-react icons
- ✅ Optimized date-fns imports
- ✅ Dynamic imports for heavy components
- ✅ React Query devtools excluded from production
- ✅ Console logs removed in production

**Estimated savings**: 305-660KB

## Need Help?

See the full guide: `docs/HOW_TO_ANALYZE_BUNDLE.md`

## Quick Commands Reference

```bash
# Full analysis with visualization (uses webpack)
pnpm run analyze

# Client bundle only
pnpm run analyze:browser

# Server bundle only  
pnpm run analyze:server

# See sizes in terminal (uses webpack)
pnpm run build:webpack

# Fast build without sizes (uses Turbopack)
pnpm run build

# Open analysis files manually (after running analyze)
open .next/analyze/client.html
open .next/analyze/server.html
```

## Important: Turbopack vs Webpack

| Command | Build Tool | Speed | Shows Sizes | Bundle Analyzer |
|---------|-----------|-------|-------------|-----------------|
| `pnpm run build` | Turbopack | ⚡ Fast | ❌ No | ❌ No |
| `pnpm run build:webpack` | Webpack | 🐢 Slower | ✅ Yes | ❌ No |
| `pnpm run analyze` | Webpack | 🐢 Slower | ✅ Yes | ✅ Yes |

**For daily development**: Use `pnpm run build` (fast Turbopack)

**For size analysis**: Use `pnpm run analyze` or `pnpm run build:webpack`

---

## ✅ Verified Working

The bundle analyzer has been tested and confirmed working with the `--webpack` flag.

**Generated files**:
- `.next/analyze/client.html` (705KB) - Client-side bundle
- `.next/analyze/nodejs.html` (812KB) - Server-side bundle  
- `.next/analyze/edge.html` (268KB) - Edge runtime bundle

**Try it now**:
```bash
pnpm run analyze
# Wait for build to complete, then:
open .next/analyze/client.html
```

See [BUNDLE_ANALYZER_FIXED.md](./BUNDLE_ANALYZER_FIXED.md) for complete details and troubleshooting.
