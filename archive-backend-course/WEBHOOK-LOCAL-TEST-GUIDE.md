# Local Webhook Testing - Simple Guide

## What You Need

- ✅ Local Supabase running (`supabase start`)
- ✅ Stripe CLI installed (`stripe --version`)
- ✅ `.env.local` configured with Stripe keys

## The Process (3 Terminals)

### Terminal 1: Start Webhook Function

```bash
supabase functions serve stripe-webhook --env-file .env.local
```

**Expected output:**
```
Serving functions on http://127.0.0.1:54321/functions/v1/<function-name>
 - http://127.0.0.1:54321/functions/v1/stripe-webhook
```

**Keep this running!** ⚠️

---

### Terminal 2: Start Stripe CLI Listener

Open a **NEW terminal** and run:

```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_abc123xyz456...
```

**IMPORTANT:** Copy the `whsec_...` secret!

**Keep this running too!** ⚠️

---

### Back to Terminal 1: Add Webhook Secret

1. **Stop** the function (press `Ctrl+C`)

2. **Add the secret** to `.env.local`:
   ```bash
   echo "STRIPE_WEBHOOK_SECRET=whsec_abc123xyz456..." >> .env.local
   ```
   (Replace with your actual secret from Terminal 2)

3. **Restart** the function:
   ```bash
   supabase functions serve stripe-webhook --env-file .env.local
   ```

---

### Terminal 3: Trigger Test Event

Open **ANOTHER new terminal** and run:

```bash
stripe trigger payment_intent.succeeded
```

**Expected output:**
```
Setting up fixture for: payment_intent
Running fixture for: payment_intent
Trigger succeeded! Check dashboard for event details.
```

---

## Check Results

### Terminal 1 (Webhook Function)
You should see:
```
🎣 Webhook received: POST
✅ Webhook verified: payment_intent.succeeded (evt_xxx)
💰 Payment succeeded: pi_xxx
   Amount: $20.00 USD
   Customer: test@example.com
```

### Terminal 2 (Stripe CLI)
You should see:
```
2025-11-04 02:51:08  --> payment_intent.succeeded [200]
```

---

## Troubleshooting

### ❌ "Invalid signature"
**Problem:** Webhook secret doesn't match

**Fix:**
1. Copy the secret from Terminal 2 (stripe listen output)
2. Update `.env.local` with the correct secret
3. Restart the webhook function (Terminal 1)

### ❌ "No webhook secret configured"
**Problem:** `STRIPE_WEBHOOK_SECRET` not in `.env.local`

**Fix:**
```bash
echo "STRIPE_WEBHOOK_SECRET=whsec_your_secret" >> .env.local
```

### ❌ "Failed to connect"
**Problem:** Webhook function not running

**Fix:**
Make sure Terminal 1 is running:
```bash
supabase functions serve stripe-webhook --env-file .env.local
```

### ❌ Event goes to production instead of local
**Problem:** Using `stripe trigger` without `stripe listen`

**Fix:**
Make sure Terminal 2 is running with `stripe listen`

---

## Quick Test Checklist

- [ ] Terminal 1: Webhook function running
- [ ] Terminal 2: Stripe CLI listening
- [ ] Webhook secret copied to `.env.local`
- [ ] Webhook function restarted after adding secret
- [ ] Terminal 3: Triggered test event
- [ ] Logs show success in Terminal 1 and 2

---

## Visual Flow

```
Terminal 3                Terminal 2              Terminal 1
(Trigger)                 (Stripe CLI)            (Webhook Function)
    │                          │                         │
    │  stripe trigger          │                         │
    │  payment_intent          │                         │
    │  .succeeded              │                         │
    │                          │                         │
    └─────────────────────────▶│                         │
                               │  Forwards to            │
                               │  localhost:54321        │
                               │                         │
                               └────────────────────────▶│
                                                         │
                                                         │ Processes
                                                         │ webhook
                                                         │
                                                         ▼
                                                    ✅ Success!
```

---

## After Testing Works

Once local testing works, you can deploy to production:

```bash
# Deploy function
supabase functions deploy stripe-webhook

# Set production webhook secret (from Stripe Dashboard)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_production_secret
```

Then test with real payments using test cards!
