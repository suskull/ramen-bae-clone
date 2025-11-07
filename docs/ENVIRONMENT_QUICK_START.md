# Environment Setup - Quick Start

## First Time Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Fill in Your Values

Open `.env.local` and replace placeholder values with your actual credentials.

#### Get Supabase Credentials:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### Get Stripe Credentials:
1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. For webhook secret:
   - Go to Developers → Webhooks
   - Add endpoint or reveal existing secret
   - Copy → `STRIPE_WEBHOOK_SECRET`

#### Get Resend Credentials:
1. Go to https://resend.com/api-keys
2. Create API key
3. Copy → `RESEND_API_KEY`
4. Set your from email → `RESEND_FROM_EMAIL`

### 3. Restart Dev Server

```bash
pnpm dev
```

## Switching Environments

### Use Local Supabase

```bash
# In .env.local, uncomment local and comment production:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key...
```

### Use Production Supabase

```bash
# In .env.local, comment local and uncomment production:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key...
```

**Always restart dev server after changes!**

## Verify Setup

### Check Environment Variables

```bash
# Run this in your project
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Check Which Database You're Using

```bash
# Should show your current Supabase URL
curl http://localhost:3000/api/categories | jq '.'
```

### Use the Validation Script

```typescript
// In any server component or API route
import { env, getEnvironmentName } from '@/lib/env';

console.log('Environment:', getEnvironmentName());
console.log('Supabase URL:', env.supabase.url);
```

## Common Issues

### "Environment variable not found"

**Solution:**
1. Check `.env.local` exists
2. Variable is not commented out
3. Restart dev server: `pnpm dev`

### "Still using wrong database"

**Solution:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
2. Restart dev server
3. Clear browser cache (Cmd+Shift+R)
4. Check: `echo $NEXT_PUBLIC_SUPABASE_URL`

### "Secrets exposed in browser console"

**Solution:**
- Remove `NEXT_PUBLIC_` prefix from private variables
- Only use `NEXT_PUBLIC_` for truly public values

## Security Checklist

- [ ] `.env.local` is in `.gitignore` ✅
- [ ] Never commit `.env.local` to git ✅
- [ ] Use different keys for dev/prod ✅
- [ ] Private keys don't have `NEXT_PUBLIC_` prefix ✅
- [ ] `.env.example` has no real secrets ✅

## Quick Commands

```bash
# Copy template
cp .env.example .env.local

# Check current environment
grep NEXT_PUBLIC_SUPABASE_URL .env.local

# Restart dev server
pnpm dev

# Check Supabase status (local)
supabase status
```

## Need More Help?

See full documentation: [docs/ENVIRONMENT_MANAGEMENT.md](./ENVIRONMENT_MANAGEMENT.md)
