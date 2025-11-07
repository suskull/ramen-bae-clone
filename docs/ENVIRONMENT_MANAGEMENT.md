# Environment Management Best Practices

## Overview

This guide covers best practices for managing different environments (local, staging, production) in your Next.js + Supabase project.

## Environment Types

### 1. **Local Development**
- Uses local Supabase instance (Docker)
- Fast iteration and testing
- No impact on production data
- Full control over database

### 2. **Staging/Preview** (Optional)
- Mirrors production setup
- Used for testing before production
- Separate Supabase project
- Can use Vercel preview deployments

### 3. **Production**
- Live application
- Real user data
- Hosted Supabase project
- Deployed on Vercel

## File Structure

### Recommended Setup

```
.env.local          # Local development (gitignored)
.env.example        # Template for team (committed to git)
.env.production     # Production secrets (Vercel only, not in git)
.env.staging        # Staging secrets (optional, not in git)
.gitignore          # Must include .env.local, .env.production
```

### Current Files

```bash
# Committed to git
.env.example        # Template with placeholder values

# Gitignored (never commit!)
.env.local          # Your local environment variables
```

## Environment Variables

### Public vs Private Variables

**Public Variables** (Exposed to browser):
- Prefix with `NEXT_PUBLIC_`
- Safe to expose (API URLs, public keys)
- Examples:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

**Private Variables** (Server-only):
- No prefix
- Never exposed to browser
- Examples:
  ```bash
  SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  RESEND_API_KEY=re_...
  ```

### Variable Categories

#### 1. **Supabase**
```bash
# Public
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Private (server-only)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

#### 2. **Stripe**
```bash
# Public
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Private
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. **Email (Resend)**
```bash
# Private
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### 4. **Application**
```bash
# Public
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Private
NODE_ENV=development
```

## Environment Switching

### Method 1: Comment/Uncomment (Current)

**Pros:** Simple, visual
**Cons:** Manual, error-prone

```bash
# .env.local

# Local Development
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=local_key...

# Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key...
```

### Method 2: Environment-Specific Files (Recommended)

**Pros:** Clean, automated, less error-prone
**Cons:** Requires setup

#### Setup:

1. **Create environment files:**

```bash
# .env.local (local development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_ENVIRONMENT=local

# .env.production (production - Vercel only)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_ENVIRONMENT=production
```

2. **Update package.json:**

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:prod": "dotenv -e .env.production next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

3. **Install dotenv-cli:**

```bash
pnpm add -D dotenv-cli
```

4. **Usage:**

```bash
# Local development
pnpm dev

# Test with production env locally
pnpm dev:prod
```

### Method 3: Environment Variable Script (Advanced)

Create a helper script to switch environments:

```bash
# scripts/switch-env.sh
#!/bin/bash

ENV=$1

if [ "$ENV" = "local" ]; then
  cp .env.local.template .env.local
  echo "Switched to LOCAL environment"
elif [ "$ENV" = "prod" ]; then
  cp .env.production.template .env.local
  echo "Switched to PRODUCTION environment"
else
  echo "Usage: ./scripts/switch-env.sh [local|prod]"
fi
```

## Vercel Deployment

### Environment Variables in Vercel

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add variables for each environment:**

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `STRIPE_SECRET_KEY` | ✅ (live) | ✅ (test) | ✅ (test) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | ✅ | ✅ |

3. **Environment-specific values:**

- **Production:** Live keys, production database
- **Preview:** Test keys, staging database (optional)
- **Development:** Test keys, local database

### Vercel CLI

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls
```

## Best Practices

### 1. **Never Commit Secrets**

```bash
# .gitignore
.env.local
.env.production
.env.staging
.env*.local
```

### 2. **Use .env.example**

```bash
# .env.example (committed to git)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 3. **Validate Environment Variables**

Create a validation file:

```typescript
// src/lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Call in app startup
validateEnv();
```

### 4. **Use Type-Safe Environment Variables**

```typescript
// src/lib/env.ts
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.RESEND_FROM_EMAIL!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  },
} as const;
```

### 5. **Document Environment Variables**

Keep a README or table documenting all variables:

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | Yes | Supabase service role key |
| `STRIPE_SECRET_KEY` | Private | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Private | Yes | Stripe webhook secret |
| `RESEND_API_KEY` | Private | Yes | Resend API key |

### 6. **Use Different Keys for Different Environments**

```bash
# Local/Development
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 7. **Rotate Secrets Regularly**

- Change production secrets every 90 days
- Immediately rotate if compromised
- Use different secrets for each environment

### 8. **Use Secret Management Tools (Advanced)**

For larger teams:
- **Vercel:** Built-in environment variables
- **Doppler:** Centralized secret management
- **AWS Secrets Manager:** For AWS deployments
- **HashiCorp Vault:** Enterprise solution

## Common Workflows

### Switching from Local to Production

```bash
# Method 1: Edit .env.local
# Comment out local, uncomment production

# Method 2: Use different files
pnpm dev:prod

# Method 3: Use script
./scripts/switch-env.sh prod
```

### Testing Production Locally

```bash
# 1. Switch to production env
# 2. Run dev server
pnpm dev:prod

# 3. Test thoroughly
# 4. Switch back to local
pnpm dev
```

### Deploying to Vercel

```bash
# 1. Ensure .env.local is gitignored
# 2. Set environment variables in Vercel Dashboard
# 3. Deploy
vercel --prod

# Or use GitHub integration (automatic)
git push origin main
```

## Troubleshooting

### "Environment variable not found"

**Check:**
1. Variable is in `.env.local`
2. Variable has correct prefix (`NEXT_PUBLIC_` for client-side)
3. Restart dev server after changes
4. Variable is not commented out

### "Using wrong database"

**Check:**
1. `NEXT_PUBLIC_SUPABASE_URL` value
2. Restart dev server
3. Clear browser cache
4. Check Supabase status: `supabase status`

### "Secrets exposed in browser"

**Fix:**
1. Remove `NEXT_PUBLIC_` prefix from private variables
2. Never use private keys in client components
3. Use API routes for server-side operations

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to git
- [ ] Different keys for dev/prod
- [ ] Public variables have `NEXT_PUBLIC_` prefix
- [ ] Private variables have no prefix
- [ ] `.env.example` has placeholder values only
- [ ] Team members have their own `.env.local`
- [ ] Production secrets are in Vercel only
- [ ] Secrets are rotated regularly

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/managing-environments)

---

**Keep your secrets safe and your environments organized!** 🔒
