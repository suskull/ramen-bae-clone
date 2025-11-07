# Environment Management - Summary

## Best Practices Implemented

### ✅ File Structure
- `.env.example` - Template (committed to git)
- `.env.local` - Your secrets (gitignored)
- `src/lib/env.ts` - Type-safe environment access
- Documentation in `docs/`

### ✅ Security
- Private variables have no `NEXT_PUBLIC_` prefix
- Public variables have `NEXT_PUBLIC_` prefix
- `.env.local` is gitignored
- Validation on startup

### ✅ Type Safety
- Centralized `env` object in `src/lib/env.ts`
- TypeScript types for all variables
- Runtime validation

### ✅ Documentation
- Quick start guide: `docs/ENVIRONMENT_QUICK_START.md`
- Complete guide: `docs/ENVIRONMENT_MANAGEMENT.md`
- This summary: `docs/ENVIRONMENT_SUMMARY.md`

## Key Concepts

### Public vs Private Variables

**Public (Browser-Accessible):**
```typescript
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Private (Server-Only):**
```typescript
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
STRIPE_SECRET_KEY=sk_test_...
```

### Environment Types

1. **Local** - `http://127.0.0.1:54321` (Docker Supabase)
2. **Production** - `https://xxx.supabase.co` (Hosted Supabase)
3. **Staging** - Optional separate environment

### Switching Environments

**Method 1: Comment/Uncomment in .env.local**
```bash
# Local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Production
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

**Method 2: Use env helper**
```typescript
import { env, getEnvironmentName } from '@/lib/env';

console.log(getEnvironmentName()); // 'local' | 'production' | 'development'
```

## Usage Examples

### In Server Components/API Routes

```typescript
import { env } from '@/lib/env';

// ✅ Good - using env helper
const supabase = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey
);

// ❌ Bad - direct process.env access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### In Client Components

```typescript
import { env } from '@/lib/env';

// ✅ Good - only public variables
const supabaseUrl = env.supabase.url;

// ❌ Bad - trying to access private variable
const serviceKey = env.supabase.serviceRoleKey; // undefined in browser!
```

### Feature Flags

```typescript
import { env } from '@/lib/env';

if (env.features.enablePayments) {
  // Show payment UI
}

if (env.features.enableEmail) {
  // Send emails
}
```

### Environment Detection

```typescript
import { isProduction, isDevelopment, isLocalSupabase } from '@/lib/env';

if (isProduction) {
  // Production-only code
}

if (isLocalSupabase) {
  // Using local Supabase
}
```

## Quick Reference

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional Variables
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `STRIPE_SECRET_KEY` (for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (for payments)
- `STRIPE_WEBHOOK_SECRET` (for webhooks)
- `RESEND_API_KEY` (for emails)
- `RESEND_FROM_EMAIL` (for emails)

### Commands
```bash
# Setup
cp .env.example .env.local

# Validate
node -e "require('./src/lib/env').validateEnv()"

# Check current environment
grep NEXT_PUBLIC_SUPABASE_URL .env.local
```

## Deployment (Vercel)

### Set Environment Variables

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set appropriate values for each environment:
   - **Production:** Live keys
   - **Preview:** Test keys
   - **Development:** Test keys

### Automatic Deployment

```bash
# Push to main branch
git push origin main

# Vercel automatically:
# 1. Pulls environment variables
# 2. Builds with production env
# 3. Deploys
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Variable not found | Check `.env.local`, restart dev server |
| Wrong database | Check `NEXT_PUBLIC_SUPABASE_URL` value |
| Secrets in browser | Remove `NEXT_PUBLIC_` prefix |
| Build fails | Check all required variables are set |

## Resources

- [Quick Start](./ENVIRONMENT_QUICK_START.md)
- [Complete Guide](./ENVIRONMENT_MANAGEMENT.md)
- [Next.js Docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Docs](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Your environment is now properly configured!** 🎉
