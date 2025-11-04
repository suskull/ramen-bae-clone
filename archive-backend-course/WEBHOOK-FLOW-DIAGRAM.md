# Stripe Webhook Flow Diagram

## Current Problem: Mixed Endpoints

```
❌ WRONG SETUP (What you're doing now):

Terminal 1:                    Terminal 2:
┌─────────────────────┐       ┌──────────────────────┐
│ stripe listen       │       │ stripe trigger       │
│ --forward-to        │       │ payment_intent       │
│ localhost:54321     │       │ .succeeded           │
└──────────┬──────────┘       └──────────┬───────────┘
           │                              │
           │ Listening...                 │ Sends to...
           │                              │
           ▼                              ▼
    localhost:54321              Stripe Dashboard Webhook
    (Local Function)             (Production URL)
                                        │
                                        ▼
                                 ❌ FAILS!
                                 "Failed to connect"
```

## Correct Setup: Local Testing

```
✅ CORRECT SETUP (Local Testing):

Terminal 1:                    Terminal 2:                Terminal 3:
┌─────────────────────┐       ┌──────────────────────┐  ┌─────────────────┐
│ supabase functions  │       │ stripe listen        │  │ stripe trigger  │
│ serve stripe-webhook│       │ --forward-to         │  │ payment_intent  │
│ --env-file .env     │       │ localhost:54321      │  │ .succeeded      │
└──────────┬──────────┘       └──────────┬───────────┘  └────────┬────────┘
           │                              │                       │
           │ Running on                   │ Listening on          │ Sends to
           │ localhost:54321              │ localhost:54321       │ CLI listener
           │                              │                       │
           ▼                              ▼                       ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                    localhost:54321                           │
    │              /functions/v1/stripe-webhook                    │
    └──────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                            ✅ SUCCESS!
                            Webhook processed
```

## Correct Setup: Production Testing

```
✅ CORRECT SETUP (Production):

Your Browser                   Stripe Dashboard           Production
┌─────────────────┐           ┌──────────────────┐      ┌─────────────────┐
│ Complete        │           │ Webhook          │      │ Edge Function   │
│ Payment         │──────────▶│ Configured       │─────▶│ stripe-webhook  │
│ (Test Card)     │           │ Production URL   │      │ (Deployed)      │
└─────────────────┘           └──────────────────┘      └─────────────────┘
                                                                  │
                                                                  ▼
                                                          ✅ SUCCESS!
                                                          Webhook processed
```

## Key Differences

### Local Testing
- **Endpoint**: `http://localhost:54321/functions/v1/stripe-webhook`
- **Secret**: From `stripe listen` output (temporary)
- **Trigger**: `stripe trigger` command (goes through CLI)
- **Use case**: Development and testing

### Production Testing
- **Endpoint**: `https://nfydvfhrepavcyclzfrh.supabase.co/functions/v1/stripe-webhook`
- **Secret**: From Stripe Dashboard (permanent)
- **Trigger**: Real payments or Dashboard test mode
- **Use case**: Live site

## Step-by-Step: Local Testing

```
Step 1: Start Local Edge Function
┌─────────────────────────────────────────────────────────┐
│ $ supabase functions serve stripe-webhook \            │
│   --env-file .env.local                                 │
│                                                         │
│ ✅ Serving on http://127.0.0.1:54321                   │
└─────────────────────────────────────────────────────────┘

Step 2: Start Stripe CLI Listener (NEW TERMINAL)
┌─────────────────────────────────────────────────────────┐
│ $ stripe listen --forward-to \                          │
│   http://localhost:54321/functions/v1/stripe-webhook    │
│                                                         │
│ > Ready! Your webhook signing secret is                │
│   whsec_abc123xyz...                                    │
│                                                         │
│ ⚠️  COPY THIS SECRET!                                   │
└─────────────────────────────────────────────────────────┘

Step 3: Add Secret to .env.local
┌─────────────────────────────────────────────────────────┐
│ $ echo "STRIPE_WEBHOOK_SECRET=whsec_abc123xyz..." \    │
│   >> .env.local                                         │
└─────────────────────────────────────────────────────────┘

Step 4: Restart Edge Function (Terminal 1)
┌─────────────────────────────────────────────────────────┐
│ Press Ctrl+C to stop                                    │
│                                                         │
│ $ supabase functions serve stripe-webhook \            │
│   --env-file .env.local                                 │
└─────────────────────────────────────────────────────────┘

Step 5: Trigger Event (NEW TERMINAL)
┌─────────────────────────────────────────────────────────┐
│ $ stripe trigger payment_intent.succeeded               │
│                                                         │
│ ✅ Event sent!                                          │
└─────────────────────────────────────────────────────────┘

Step 6: Check Logs
┌─────────────────────────────────────────────────────────┐
│ Terminal 1 (Edge Function):                             │
│ 🎣 Webhook received: POST                               │
│ ✅ Webhook verified: payment_intent.succeeded           │
│ 💰 Payment succeeded: pi_xxx                            │
│                                                         │
│ Terminal 2 (Stripe CLI):                                │
│ --> payment_intent.succeeded [200]                      │
└─────────────────────────────────────────────────────────┘
```

## Common Mistakes

### ❌ Mistake 1: Using Dashboard Webhook for Local Testing
```
stripe trigger payment_intent.succeeded
    │
    └──▶ Tries to send to production URL
         ❌ Fails if not deployed
```

### ❌ Mistake 2: Wrong Webhook Secret
```
.env.local has: whsec_old_secret
stripe listen gives: whsec_new_secret
    │
    └──▶ Signature verification fails
```

### ❌ Mistake 3: Not Restarting After Secret Change
```
1. Add STRIPE_WEBHOOK_SECRET to .env.local
2. Forget to restart Edge Function
    │
    └──▶ Function still uses old/missing secret
```

## Quick Reference

| Action | Command |
|--------|---------|
| Start local function | `supabase functions serve stripe-webhook --env-file .env.local` |
| Start Stripe listener | `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook` |
| Trigger test event | `stripe trigger payment_intent.succeeded` |
| Deploy to production | `supabase functions deploy stripe-webhook` |
| Set production secret | `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...` |
| Check production logs | Supabase Dashboard → Edge Functions → Logs |
