# Deployment Quick Reference

Quick commands and checklists for deploying the Ramen Bae platform.

## 🚀 Quick Deploy (Vercel + Supabase)

### First Time Setup

```bash
# 1. Install CLI tools
pnpm add -g vercel

# 2. Login to services
vercel login

# 3. Link Supabase project
supabase link --project-ref your-project-ref

# 4. Push database schema
supabase db push

# 5. Deploy Edge Functions
supabase functions deploy

# 6. Deploy to Vercel
vercel --prod
```

### Subsequent Deployments

```bash
# Just push to main branch (if Git connected)
git push origin main

# Or deploy manually
vercel --prod
```

---

## 📝 Essential Commands

### Vercel

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Rollback
vercel rollback [deployment-url]

# Environment variables
vercel env add VAR_NAME production
vercel env ls
vercel env pull .env.production
```

### Supabase

```bash
# Link project
supabase link --project-ref your-ref

# Push migrations
supabase db push

# Deploy functions
supabase functions deploy
supabase functions deploy function-name

# Set secrets
supabase secrets set KEY=value

# Generate types
supabase gen types typescript --project-id your-ref > src/lib/supabase/database.types.ts

# View logs
supabase functions logs function-name
```

### Build & Test

```bash
# Build locally
pnpm build

# Type check
pnpm type-check

# Start production server locally
pnpm start
```

---

## ✅ Pre-Deployment Checklist

### Code

- [ ] `pnpm build` succeeds
- [ ] `pnpm type-check` passes
- [ ] All tests passing
- [ ] No console errors

### Database

- [ ] Migrations in `supabase/migrations/`
- [ ] Migrations tested locally
- [ ] RLS policies configured
- [ ] Storage buckets created

### Environment

- [ ] All variables documented
- [ ] Production keys obtained
- [ ] Stripe live keys ready
- [ ] Domain configured (if custom)

---

## 🔑 Required Environment Variables

### Vercel Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe (LIVE keys!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Supabase Secrets (Edge Functions)

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set RESEND_API_KEY=re_...
```

---

## 🔄 Deployment Workflow

### Standard Deployment

```
1. Develop locally
2. Test thoroughly
3. Commit changes
4. Push to main
   ↓
5. Vercel auto-deploys
6. Verify deployment
7. Monitor logs
```

### Database Changes

```
1. Create migration locally
   supabase migration new feature_name

2. Apply locally
   supabase db reset

3. Test application

4. Push to production
   supabase db push

5. Verify schema
   supabase gen types typescript --project-id your-ref
```

### Edge Function Changes

```
1. Develop function locally
   supabase functions serve function-name

2. Test with curl/Postman

3. Deploy to production
   supabase functions deploy function-name

4. Test production endpoint

5. Monitor logs
   supabase functions logs function-name
```

---

## 🐛 Common Issues & Fixes

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### Environment Variables Not Working

```bash
# Verify variables
vercel env ls

# Pull latest
vercel env pull

# Redeploy
vercel --prod --force
```

### Database Connection Issues

```bash
# Verify connection
supabase db ping

# Check migrations
supabase db diff

# Relink if needed
supabase link --project-ref your-ref
```

### Stripe Webhooks Not Working

1. Check webhook URL: `https://yourdomain.com/api/webhooks/stripe`
2. Verify webhook secret in Vercel
3. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe
   stripe trigger checkout.session.completed
   ```

### Images Not Loading

1. Check Supabase storage bucket is public
2. Verify `next.config.ts` remote patterns
3. Check image URLs in database

---

## 🔙 Rollback Procedures

### Rollback Vercel Deployment

```bash
# Via CLI
vercel rollback [previous-deployment-url]

# Via Dashboard
1. Go to Deployments
2. Find working version
3. Click ⋯ → Promote to Production
```

### Rollback Database

```bash
# Option 1: Restore from backup (Supabase Dashboard)
# Settings → Database → Backups → Restore

# Option 2: Create rollback migration
supabase migration new rollback_feature
# Edit migration to reverse changes
supabase db push
```

---

## 📊 Post-Deployment Verification

### Automated Tests

```bash
# Test critical paths
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/products
```

### Manual Checks

- [ ] Homepage loads
- [ ] Products display
- [ ] User can sign up/login
- [ ] Cart functionality works
- [ ] Checkout completes
- [ ] Payment processes
- [ ] Emails send
- [ ] Images load

### Monitoring

```bash
# View Vercel logs
vercel logs --follow

# View Supabase logs
supabase functions logs function-name --follow

# Check Stripe Dashboard
# https://dashboard.stripe.com/events
```

---

## 🔐 Security Checklist

### Before Going Live

- [ ] All RLS policies enabled
- [ ] Service role key only in server code
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Stripe webhook signatures verified
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive info

### After Deployment

- [ ] Test authentication flows
- [ ] Verify payment processing
- [ ] Check email delivery
- [ ] Test file uploads
- [ ] Review error logs
- [ ] Monitor API usage

---

## 📈 Performance Optimization

### After First Deployment

```bash
# Analyze bundle size
pnpm analyze

# Check Vercel Speed Insights
# Dashboard → Speed Insights

# Monitor Supabase performance
# Dashboard → Reports
```

### Optimization Tips

1. **Enable ISR for product pages**
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

2. **Optimize images** (already configured)
   - WebP format
   - Responsive sizes
   - Lazy loading

3. **Database indexes**
   ```sql
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_orders_user ON orders(user_id);
   ```

4. **Edge caching**
   - Static assets cached automatically
   - API routes can use `Cache-Control` headers

---

## 🆘 Emergency Procedures

### Site Down

1. **Check Vercel Status**
   - https://www.vercel-status.com

2. **Check Supabase Status**
   - https://status.supabase.com

3. **View Logs**
   ```bash
   vercel logs --follow
   ```

4. **Rollback if Needed**
   ```bash
   vercel rollback [last-working-deployment]
   ```

### Database Issues

1. **Check Connection**
   ```bash
   supabase db ping
   ```

2. **View Database Logs**
   - Supabase Dashboard → Logs

3. **Restore from Backup**
   - Supabase Dashboard → Settings → Database → Backups

### Payment Issues

1. **Check Stripe Dashboard**
   - https://dashboard.stripe.com/events

2. **Verify Webhook Delivery**
   - Dashboard → Developers → Webhooks

3. **Test Webhook Endpoint**
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## 📞 Getting Help

### Check Logs First

```bash
# Vercel logs
vercel logs

# Supabase function logs
supabase functions logs function-name

# Stripe events
# https://dashboard.stripe.com/events
```

### Documentation

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Supabase Workflow](./SUPABASE_WORKFLOW.md)
- [Environment Setup](./ENVIRONMENT_QUICK_START.md)

### Support Channels

- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
- Stripe: https://support.stripe.com

---

## 🎯 Quick Links

### Dashboards

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Resend Dashboard](https://resend.com/dashboard)

### Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)

---

**Need more details?** See the [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
