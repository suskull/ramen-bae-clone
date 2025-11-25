# Exercise 03: Email Notifications - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Get Resend API Key (2 minutes)

1. Go to [resend.com](https://resend.com) and sign up
2. Dashboard → API Keys → Create API Key
3. Copy the key (starts with `re_`)

### 2. Configure Environment (1 minute)

Add to `.env.local`:
```bash
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 3. Start Edge Function (1 minute)

```bash
supabase functions serve send-email --env-file .env.local --no-verify-jwt
```

### 4. Run Tests (1 minute)

```bash
./test-send-email.sh
```

## 📧 Send Your First Email

### Using cURL

```bash
# Get JWT token
JWT=$(node get-test-jwt.js)

# Send welcome email
curl -X POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "your-email@example.com",
    "subject": "Welcome!",
    "template": "welcome",
    "templateData": {
      "name": "Your Name"
    }
  }'
```

### Using Frontend Component

1. Add component to your page:
```typescript
import SendEmailTest from '@/components/send-email-test';

export default function Page() {
  return <SendEmailTest />;
}
```

2. Visit the page and fill out the form
3. Click "Send Email"
4. Check your inbox!

## 📝 Available Templates

### 1. Welcome Email
```json
{
  "template": "welcome",
  "templateData": {
    "name": "John Doe",
    "dashboardUrl": "https://yourapp.com/dashboard"
  }
}
```

### 2. Order Confirmation
```json
{
  "template": "order-confirmation",
  "templateData": {
    "name": "Jane Smith",
    "orderId": "ORD-12345",
    "total": 99.99,
    "items": [
      {"name": "Product A", "quantity": 2, "price": 29.99}
    ]
  }
}
```

### 3. Password Reset
```json
{
  "template": "password-reset",
  "templateData": {
    "name": "Alex",
    "resetLink": "https://yourapp.com/reset?token=abc123"
  }
}
```

## 🎯 Common Use Cases

### Send Custom HTML Email
```bash
curl -X POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "user@example.com",
    "subject": "Custom Email",
    "html": "<h1>Hello!</h1><p>Custom content here</p>",
    "text": "Hello! Custom content here"
  }'
```

### Send to Multiple Recipients
```bash
curl -X POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{
    "to": ["user1@example.com", "user2@example.com"],
    "cc": "manager@example.com",
    "subject": "Team Update",
    "html": "<p>Team notification</p>"
  }'
```

## 🔍 Debugging

### Check Function Logs
```bash
supabase functions logs send-email --tail
```

### Check Resend Dashboard
1. Go to [resend.com/emails](https://resend.com/emails)
2. View sent emails and delivery status

### Common Issues

**Email not sending?**
- Check RESEND_API_KEY is set
- Verify JWT token is valid
- Check function logs for errors

**Template not working?**
- Verify template name is correct
- Check all required templateData fields are provided

**CORS error?**
- Make sure origin is in allowed list
- Check CORS headers are being sent

## 📊 Email Logging

### Create Database Table
```sql
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  email_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);
```

### View Logs
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

## 🚀 Deploy to Production

```bash
# Set production secrets
supabase secrets set RESEND_API_KEY=re_your_production_key
supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com

# Deploy
supabase functions deploy send-email

# Test
curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
  -H "Authorization: Bearer $PRODUCTION_JWT" \
  -H 'Content-Type: application/json' \
  -d '{"to":"test@example.com","subject":"Test","template":"welcome","templateData":{"name":"Test"}}'
```

## 💡 Pro Tips

1. **Use test mode**: `onboarding@resend.dev` for development
2. **Verify domain**: For production, verify your domain in Resend
3. **Rate limits**: Free tier = 100 emails/day
4. **Email logs**: Always log emails for debugging
5. **Error handling**: Check Resend dashboard for delivery issues

## 📚 Next Steps

1. ✅ Complete Exercise 03
2. 🎨 Customize email templates
3. 📊 Set up email logging
4. 🔔 Integrate with Stripe webhooks (Exercise 02)
5. ⚡ Add real-time notifications (Exercise 04)

## 🆘 Need Help?

- 📖 Full guide: `03-email-notifications.md`
- 🔧 Troubleshooting: See main exercise guide
- 💬 Resend docs: [resend.com/docs](https://resend.com/docs)
- 🎯 Supabase docs: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

---

**Ready to send emails!** 📧✨
