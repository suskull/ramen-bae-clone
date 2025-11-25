# 🚀 Start Here: Test Stripe Webhook Locally

## Quick Start (Copy & Paste These Commands)

### Step 1: Open Terminal 1
```bash
supabase functions serve stripe-webhook --env-file .env.local
```
✅ **Leave this running!**

---

### Step 2: Open Terminal 2 (New Window)
```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

📋 **Copy the webhook secret** that appears (starts with `whsec_`)

✅ **Leave this running too!**

---

### Step 3: Back to Terminal 1
Press `Ctrl+C` to stop, then:

```bash
# Replace whsec_YOUR_SECRET with the actual secret from Step 2
echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET" >> .env.local

# Restart the function
supabase functions serve stripe-webhook --env-file .env.local
```

---

### Step 4: Open Terminal 3 (Another New Window)
```bash
stripe trigger payment_intent.succeeded
```

---

### Step 5: Check Results

**Terminal 1** should show:
```
🎣 Webhook received: POST
✅ Webhook verified: payment_intent.succeeded
💰 Payment succeeded: pi_xxx
```

**Terminal 2** should show:
```
--> payment_intent.succeeded [200]
```

---

## ✅ Success!

If you see the above messages, your webhook is working locally!

## ❌ Problems?

### "Invalid signature"
- Make sure you copied the correct `whsec_...` secret from Terminal 2
- Make sure you restarted the function after adding the secret

### "No webhook secret configured"
- Check that `.env.local` has `STRIPE_WEBHOOK_SECRET=whsec_...`
- Make sure there are no typos

### Nothing happens
- Make sure all 3 terminals are running
- Make sure Terminal 2 shows "Ready! Your webhook signing secret is..."

---

## What's Next?

Once local testing works:
1. Deploy to production: `supabase functions deploy stripe-webhook`
2. Set production secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_prod_secret`
3. Test with real payments!

---

## Need More Help?

Read the detailed guides:
- `WEBHOOK-LOCAL-TEST-GUIDE.md` - Detailed step-by-step
- `WEBHOOK-FLOW-DIAGRAM.md` - Visual diagrams
- `WEBHOOK-TESTING-GUIDE.md` - Complete reference
