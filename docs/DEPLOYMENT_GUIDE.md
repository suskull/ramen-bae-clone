# Deployment Guide

Complete guide for deploying the Ramen Bae e-commerce platform to production.

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Options](#deployment-options)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Supabase Production Setup](#supabase-production-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment Steps](#post-deployment-steps)
- [Alternative Deployment Options](#alternative-deployment-options)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

---

## Overview

This project consists of two main components:

1. **Frontend**: Next.js application (deployed to Vercel)
2. **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)

### Architecture

```
┌─────────────────┐
│   Vercel CDN    │  ← Next.js App
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼──────────┐
│  Supabase API   │  │  Stripe API   │
│  - Database     │  │  - Payments   │
│  - Auth         │  │  - Webhooks   │
│  - Storage      │  └───────────────┘
│  - Edge Funcs   │
└─────────────────┘
```

---

## Pre-Deployment Checklist

### ✅ Code Preparation

- [ ] All tests passing locally
- [ ] Build succeeds: `pnpm build`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] Environment variables documented
- [ ] Database migrations tested locally
- [ ] Edge Functions tested locally

### ✅ Accounts Setup

- [ ] Vercel account created
- [ ] Supabase production project created
- [ ] Stripe account (production mode)
- [ ] Resend account (if using email)
- [ ] Custom domain registered (optional)

### ✅ Database Preparation

- [ ] All migrations in `supabase/migrations/` folder
- [ ] Seed data prepared (if needed)
- [ ] RLS policies tested
- [ ] Storage buckets configured

---

## Deployment Options

### Recommended Stack

| Component | Platform | Why |
|-----------|----------|-----|
| Frontend | Vercel | Native Next.js support, automatic deployments |
| Database | Supabase | Managed PostgreSQL, Auth, Storage |
| Payments | Stripe | Industry standard, secure |
| Email | Resend | Developer-friendly, reliable |

### Alternative Options

- **Frontend**: Railway, DigitalOcean, AWS Amplify, Netlify
- **Backend**: Self-hosted Supabase, Firebase, AWS RDS
- **Containerized**: Docker + Kubernetes

---

## Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI

```bash
pnpm add -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Initial Deployment

```bash
# From project root
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No
- **Project name?** ramen-bae (or your choice)
- **Directory?** ./ (press Enter)
- **Override settings?** No

This creates a preview deployment.

### Step 4: Configure Project Settings

#### Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all required variables (see [Environment Variables](#environment-variables))

#### Via CLI

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add all other variables
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

### Step 6: Configure Custom Domain (Optional)

#### Via Dashboard
1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as shown

#### DNS Configuration
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

### Step 7: Enable Automatic Deployments

#### Connect Git Repository

1. Go to **Settings** → **Git**
2. Connect your GitHub/GitLab/Bitbucket repository
3. Configure:
   - **Production Branch**: `main`
   - **Preview Branches**: All branches
   - **Auto-deploy**: Enabled

Now every push to `main` automatically deploys to production!

---

## Supabase Production Setup

### Step 1: Create Production Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in details:
   - **Name**: ramen-bae-production
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select appropriate tier

### Step 2: Link Local Project to Production

```bash
# Get your project reference from Supabase dashboard
# Settings → General → Reference ID

supabase link --project-ref your-project-ref
```

Enter your database password when prompted.

### Step 3: Push Database Schema

```bash
# Push all migrations to production
supabase db push
```

This applies all migration files in `supabase/migrations/` to production.

### Step 4: Verify Schema

```bash
# Generate types from production
supabase gen types typescript --project-id your-project-ref > src/lib/supabase/database.types.ts
```

Compare with local types to ensure they match.

### Step 5: Seed Production Database (Optional)

#### Option A: Via SQL Editor (Recommended)

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase/seed.sql`
3. Paste and run

#### Option B: Via CLI

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < supabase/seed.sql
```

### Step 6: Configure Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - `product-images` (public)
   - `user-avatars` (public)
3. Set up RLS policies for each bucket

#### Product Images Bucket Policy

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

### Step 7: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy create-checkout-session
supabase functions deploy handle-stripe-webhook
```

### Step 8: Configure Edge Function Secrets

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_key

# Set other secrets
supabase secrets set RESEND_API_KEY=re_your_key
```

### Step 9: Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Add your production URLs:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: 
     - `https://yourdomain.com/auth/callback`
     - `https://yourdomain.com/auth/confirm`

3. Go to **Authentication** → **Providers**
4. Configure email settings:
   - **Enable Email Provider**: Yes
   - **Confirm Email**: Yes (recommended)
   - **Secure Email Change**: Yes

### Step 10: Configure CORS

1. Go to **Settings** → **API**
2. Add allowed origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

---

## Environment Variables

### Production Environment Variables

Create these in Vercel Dashboard under **Settings** → **Environment Variables**.

#### Supabase Variables

```bash
# Get from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Stripe Variables

```bash
# Get from: Stripe Dashboard → Developers → API Keys
# IMPORTANT: Use LIVE keys (pk_live_... and sk_live_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key

# Get from: Stripe Dashboard → Developers → Webhooks
# Create webhook endpoint: https://yourdomain.com/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Resend Variables (Email)

```bash
# Get from: Resend Dashboard → API Keys
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Application Variables

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Setting Variables via CLI

```bash
# Set all at once
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_ENVIRONMENT production
```

### Importing from File

Create `.env.production`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# ... all other variables
```

Then import:

```bash
vercel env pull .env.production
```

---

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs
```

### 2. Test Critical Paths

- [ ] Homepage loads correctly
- [ ] Product pages display
- [ ] User can sign up/login
- [ ] Shopping cart works
- [ ] Checkout process completes
- [ ] Payment processing works
- [ ] Email notifications sent
- [ ] Images load properly

### 3. Configure Stripe Webhooks

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret
6. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`

### 4. Test Stripe Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local (for testing)
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

### 5. Set Up Monitoring

#### Vercel Analytics

1. Go to **Analytics** tab in Vercel Dashboard
2. Enable **Web Analytics**
3. Enable **Speed Insights**

#### Supabase Monitoring

1. Go to **Reports** in Supabase Dashboard
2. Monitor:
   - API requests
   - Database performance
   - Auth activity
   - Storage usage

### 6. Configure Error Tracking (Optional)

#### Sentry Integration

```bash
pnpm add @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

### 7. Set Up Backups

#### Database Backups

Supabase automatically backs up your database daily. To configure:

1. Go to **Settings** → **Database**
2. Configure backup retention
3. Enable Point-in-Time Recovery (PITR) for Pro plan

#### Manual Backup

```bash
# Export database
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup.sql

# Export specific table
pg_dump -t products "postgresql://..." > products_backup.sql
```

### 8. Configure CDN (Optional)

Vercel includes CDN by default, but for additional optimization:

1. Enable **Image Optimization** (included)
2. Configure **Edge Functions** for dynamic content
3. Set up **ISR** (Incremental Static Regeneration) for product pages

---

## Alternative Deployment Options

### Option 1: Railway

Railway provides simple deployment with automatic SSL.

#### Setup

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
# ... add all variables

# Deploy
railway up
```

#### Configuration

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 2: DigitalOcean App Platform

#### Setup

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `pnpm build`
   - **Run Command**: `pnpm start`
   - **HTTP Port**: 3000
5. Add environment variables
6. Deploy

### Option 3: Docker Deployment

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Update next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Add this for Docker
  // ... rest of config
};
```

#### Build and Run

```bash
# Build image
docker build -t ramen-bae .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  # ... add all environment variables
  ramen-bae
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

### Option 4: AWS Amplify

#### Setup

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **New app** → **Host web app**
3. Connect repository
4. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

5. Add environment variables
6. Deploy

---

## Troubleshooting

### Build Failures

#### Error: "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

#### Error: "Type errors"

```bash
# Regenerate types
supabase gen types typescript --project-id your-project-ref > src/lib/supabase/database.types.ts

# Check for errors
pnpm type-check
```

### Runtime Errors

#### Error: "Failed to fetch"

**Cause**: CORS or environment variable issues

**Solution**:
1. Check Supabase CORS settings
2. Verify environment variables in Vercel
3. Check API URL is correct

```bash
# Verify variables
vercel env ls
```

#### Error: "Authentication failed"

**Cause**: Incorrect Supabase keys or URL configuration

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Ensure redirect URLs are configured in Supabase Auth settings

### Database Issues

#### Error: "relation does not exist"

**Cause**: Migrations not applied to production

**Solution**:
```bash
# Push migrations
supabase db push

# Verify schema
supabase db diff
```

#### Error: "RLS policy violation"

**Cause**: Row Level Security policies not configured

**Solution**:
1. Review RLS policies in Supabase Dashboard
2. Test policies with different user roles
3. Update policies as needed

### Stripe Issues

#### Error: "Invalid webhook signature"

**Cause**: Webhook secret mismatch

**Solution**:
1. Get new webhook secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
3. Redeploy application

#### Error: "Payment failed"

**Cause**: Test mode keys in production

**Solution**:
1. Verify using live keys (`pk_live_...` and `sk_live_...`)
2. Check Stripe account is activated
3. Review Stripe Dashboard for errors

### Performance Issues

#### Slow Page Loads

**Solutions**:
1. Enable ISR for product pages
2. Optimize images (already configured)
3. Check database query performance
4. Enable Vercel Edge Functions

```typescript
// app/products/[id]/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

#### High Database Load

**Solutions**:
1. Add database indexes
2. Implement caching with React Query
3. Use database connection pooling
4. Upgrade Supabase plan if needed

---

## Rollback Procedures

### Rollback Vercel Deployment

#### Via Dashboard

1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

#### Via CLI

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Rollback Database Migration

#### Option 1: Restore from Backup

```bash
# Download backup from Supabase Dashboard
# Settings → Database → Backups

# Restore
psql "postgresql://..." < backup.sql
```

#### Option 2: Create Rollback Migration

```bash
# Create new migration to undo changes
supabase migration new rollback_feature_name

# Edit migration file to reverse changes
# Then push
supabase db push
```

### Emergency Rollback Checklist

- [ ] Identify issue and affected deployment
- [ ] Notify team
- [ ] Rollback Vercel deployment
- [ ] Rollback database if needed
- [ ] Verify application works
- [ ] Check error logs
- [ ] Document issue
- [ ] Plan fix

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Edge Functions tested

### Deployment

- [ ] Supabase production project created
- [ ] Database schema pushed
- [ ] Edge Functions deployed
- [ ] Vercel project configured
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### Post-Deployment

- [ ] Application accessible
- [ ] Authentication works
- [ ] Database queries work
- [ ] Payments process correctly
- [ ] Emails send successfully
- [ ] Images load properly
- [ ] Stripe webhooks configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Team notified

---

## Continuous Deployment

### Automatic Deployments

With Git integration enabled:

```bash
# Production deployment
git push origin main

# Preview deployment
git push origin feature-branch
```

### Deployment Workflow

```
Developer Push → GitHub → Vercel Build → Deploy → Notify
                    ↓
              Run Tests
                    ↓
              Type Check
                    ↓
              Build App
```

### Branch Strategy

- `main` → Production
- `staging` → Staging environment (optional)
- `feature/*` → Preview deployments

### Environment-Specific Deployments

```bash
# Deploy to specific environment
vercel --prod                    # Production
vercel                           # Preview
vercel --target staging          # Staging (if configured)
```

---

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.local` or `.env.production`
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly
- ✅ Use Vercel's encrypted environment variables

### 2. Database Security

- ✅ Enable RLS on all tables
- ✅ Use service role key only in server-side code
- ✅ Implement proper authentication checks
- ✅ Regular security audits

### 3. API Security

- ✅ Validate all inputs
- ✅ Rate limit API endpoints
- ✅ Use HTTPS only
- ✅ Implement CSRF protection

### 4. Stripe Security

- ✅ Verify webhook signatures
- ✅ Use live keys only in production
- ✅ Never expose secret keys to client
- ✅ Implement idempotency keys

---

## Monitoring and Maintenance

### Daily Checks

- [ ] Check error logs in Vercel
- [ ] Monitor Supabase API usage
- [ ] Review Stripe transactions
- [ ] Check application uptime

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check database size and growth
- [ ] Review security logs
- [ ] Update dependencies (if needed)

### Monthly Tasks

- [ ] Review and optimize database queries
- [ ] Analyze bundle size
- [ ] Review and update documentation
- [ ] Security audit
- [ ] Backup verification

---

## Support and Resources

### Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Community

- [Vercel Discord](https://vercel.com/discord)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)

### Internal Resources

- [Environment Quick Start](./ENVIRONMENT_QUICK_START.md)
- [Supabase Workflow](./SUPABASE_WORKFLOW.md)
- [Database Migration Guide](./database-migration/README.md)

---

**Deployment completed?** 🎉 Don't forget to celebrate and monitor your application!
