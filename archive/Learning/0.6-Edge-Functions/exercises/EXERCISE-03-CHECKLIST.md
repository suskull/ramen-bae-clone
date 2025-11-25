# Exercise 03: Email Notifications - Student Checklist

## Pre-Exercise Setup ✅

- [ ] Completed Exercise 02 (Stripe Payment Processing)
- [ ] Local Supabase instance running (`supabase start`)
- [ ] Node.js and npm installed
- [ ] Code editor open
- [ ] Terminal ready

## Part 1: Resend Setup (5 minutes)

### Account Creation
- [ ] Visited [resend.com](https://resend.com)
- [ ] Created free account
- [ ] Verified email address
- [ ] Logged into dashboard

### API Key
- [ ] Navigated to API Keys section
- [ ] Created new API key
- [ ] Named it "Supabase Edge Functions - Development"
- [ ] Copied API key (starts with `re_`)
- [ ] Saved key securely

### Environment Configuration
- [ ] Opened `.env.local` file
- [ ] Added `RESEND_API_KEY=re_...`
- [ ] Added `RESEND_FROM_EMAIL=onboarding@resend.dev`
- [ ] Saved file
- [ ] Verified no syntax errors

### Domain Verification (Optional)
- [ ] Skipped for now (using test sender)
- [ ] Noted for production deployment

## Part 2: Email Edge Function (10 minutes)

### Review Function Code
- [ ] Opened `supabase/functions/send-email/index.ts`
- [ ] Reviewed `Deno.serve()` pattern
- [ ] Understood CORS handling
- [ ] Reviewed authentication logic
- [ ] Examined template system
- [ ] Checked error handling

### Start Local Function
- [ ] Opened terminal
- [ ] Ran `supabase functions serve send-email --env-file .env.local --no-verify-jwt`
- [ ] Saw success message
- [ ] Function listening on port 54321
- [ ] Kept terminal open

### Run Automated Tests
- [ ] Opened new terminal
- [ ] Made script executable: `chmod +x test-send-email.sh`
- [ ] Ran `./test-send-email.sh`
- [ ] All 5 tests passed
- [ ] Checked inbox for test emails

### Manual Testing
- [ ] Got JWT token: `node get-test-jwt.js`
- [ ] Copied token
- [ ] Tested with cURL command
- [ ] Received success response
- [ ] Checked email inbox
- [ ] Verified email received

### Check Logs
- [ ] Reviewed function logs in terminal
- [ ] Saw emoji-enhanced logging
- [ ] Understood log messages
- [ ] No errors present

### Production Deployment (Optional)
- [ ] Skipped for now
- [ ] Noted commands for later

## Part 3: Email Templates (5 minutes)

### Review Templates
- [ ] Opened `index.ts` and found `generateEmailFromTemplate()`
- [ ] Reviewed Welcome template
- [ ] Reviewed Order Confirmation template
- [ ] Reviewed Password Reset template
- [ ] Understood HTML structure
- [ ] Noted CSS styling

### Test Each Template
- [ ] Tested Welcome email
  - [ ] Sent via cURL or test script
  - [ ] Received email
  - [ ] Verified design
  - [ ] Checked personalization
  
- [ ] Tested Order Confirmation
  - [ ] Sent with order data
  - [ ] Received email
  - [ ] Verified order details
  - [ ] Checked item table
  
- [ ] Tested Password Reset
  - [ ] Sent with reset link
  - [ ] Received email
  - [ ] Verified security warning
  - [ ] Checked reset button

### Template Customization (Optional)
- [ ] Skipped for now
- [ ] Noted how to add custom templates

## Part 4: Frontend Integration (5 minutes)

### Create Test Component
- [ ] Created `components/send-email-test.tsx`
- [ ] Copied component code
- [ ] Reviewed useState hooks
- [ ] Understood form handling
- [ ] Checked error handling

### Add to Page
- [ ] Created `app/test-email/page.tsx`
- [ ] Imported component
- [ ] Saved file
- [ ] No TypeScript errors

### Test in Browser
- [ ] Started Next.js: `npm run dev`
- [ ] Navigated to `/test-email`
- [ ] Saw form render
- [ ] Filled in email address
- [ ] Filled in name
- [ ] Selected template
- [ ] Clicked "Send Email"
- [ ] Saw success message
- [ ] Checked inbox
- [ ] Received email

## Part 5: Email Logging (5 minutes)

### Create Database Table
- [ ] Opened Supabase SQL Editor
- [ ] Copied SQL from exercise
- [ ] Ran CREATE TABLE statement
- [ ] Ran RLS policies
- [ ] Ran trigger creation
- [ ] Verified table created

### Test Logging
- [ ] Sent test email
- [ ] Opened SQL Editor
- [ ] Ran: `SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10`
- [ ] Saw log entry
- [ ] Verified all fields populated

### Create History Component (Optional)
- [ ] Created `components/email-history.tsx`
- [ ] Copied component code
- [ ] Added to page
- [ ] Tested in browser
- [ ] Saw email history

## Challenges (Optional)

### Challenge 1: Email Queue
- [ ] Read challenge description
- [ ] Planned implementation
- [ ] Created queue table
- [ ] Implemented processing
- [ ] Tested queue system

### Challenge 2: Email Attachments
- [ ] Read challenge description
- [ ] Researched Resend attachments API
- [ ] Implemented file upload
- [ ] Tested with attachment
- [ ] Verified delivery

### Challenge 3: Unsubscribe System
- [ ] Read challenge description
- [ ] Created preferences table
- [ ] Added unsubscribe link
- [ ] Implemented handler
- [ ] Tested unsubscribe flow

### Challenge 4: Email Analytics
- [ ] Read challenge description
- [ ] Implemented tracking pixel
- [ ] Created link tracking
- [ ] Stored analytics
- [ ] Built dashboard

### Challenge 5: Multi-Language
- [ ] Read challenge description
- [ ] Created translation files
- [ ] Implemented language detection
- [ ] Tested multiple languages
- [ ] Verified translations

### Challenge 6: React Email
- [ ] Read challenge description
- [ ] Installed React Email
- [ ] Created React components
- [ ] Integrated with function
- [ ] Tested rendering

## Integration with Exercise 02 (Optional)

### Stripe + Email Integration
- [ ] Read integration guide
- [ ] Updated stripe-webhook function
- [ ] Added email sending logic
- [ ] Tested payment flow
- [ ] Verified email sent after payment
- [ ] Checked email content
- [ ] Reviewed logs

## Troubleshooting

### Common Issues Encountered
- [ ] Email not sending
  - [ ] Checked RESEND_API_KEY
  - [ ] Verified API key permissions
  - [ ] Checked function logs
  
- [ ] Authentication errors
  - [ ] Verified JWT token
  - [ ] Checked token expiration
  - [ ] Regenerated token
  
- [ ] Template not rendering
  - [ ] Checked template name
  - [ ] Verified templateData
  - [ ] Reviewed function logs
  
- [ ] CORS errors
  - [ ] Checked origin
  - [ ] Verified CORS headers
  - [ ] Reviewed allowed origins

## Documentation Review

- [ ] Read main exercise guide
- [ ] Read quick start guide
- [ ] Read integration guide
- [ ] Read flow diagrams
- [ ] Bookmarked for reference

## Learning Outcomes

### Concepts Understood
- [ ] Resend API integration
- [ ] Edge Function patterns
- [ ] Email template design
- [ ] User authentication
- [ ] Error handling
- [ ] Testing strategies
- [ ] Production deployment

### Skills Acquired
- [ ] Can send emails from Edge Functions
- [ ] Can create email templates
- [ ] Can handle multiple recipients
- [ ] Can log email activity
- [ ] Can test email functionality
- [ ] Can integrate with Stripe
- [ ] Can deploy to production

## Final Checks

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Clean code structure
- [ ] Proper error handling
- [ ] Good logging practices

### Testing
- [ ] All automated tests pass
- [ ] Manual tests successful
- [ ] Templates render correctly
- [ ] Emails deliver successfully
- [ ] Logging works properly

### Documentation
- [ ] Code is commented
- [ ] README updated (if applicable)
- [ ] Environment variables documented
- [ ] Deployment steps noted

## Next Steps

- [ ] Completed Exercise 03 ✅
- [ ] Ready for Exercise 04 (Real-time Features)
- [ ] Noted areas for improvement
- [ ] Identified additional features to add
- [ ] Planned production deployment

## Time Tracking

- Part 1 (Resend Setup): _____ minutes
- Part 2 (Edge Function): _____ minutes
- Part 3 (Templates): _____ minutes
- Part 4 (Frontend): _____ minutes
- Part 5 (Logging): _____ minutes
- Challenges: _____ minutes
- Total Time: _____ minutes

**Target Time**: 30 minutes (without challenges)

## Self-Assessment

### Understanding (1-5)
- Resend API: ___/5
- Edge Functions: ___/5
- Email Templates: ___/5
- Authentication: ___/5
- Error Handling: ___/5

### Confidence (1-5)
- Can implement email features: ___/5
- Can debug email issues: ___/5
- Can customize templates: ___/5
- Can deploy to production: ___/5
- Can integrate with other services: ___/5

## Notes

### What Went Well
```
[Your notes here]
```

### Challenges Faced
```
[Your notes here]
```

### Questions
```
[Your notes here]
```

### Ideas for Improvement
```
[Your notes here]
```

## Instructor Sign-Off (If Applicable)

- [ ] Student completed all required tasks
- [ ] Code quality is acceptable
- [ ] Tests are passing
- [ ] Student understands concepts
- [ ] Ready to proceed to Exercise 04

**Instructor Signature**: ________________  
**Date**: ________________

---

## 🎉 Congratulations!

You've completed Exercise 03: Email Notifications!

**What You've Accomplished:**
- ✅ Set up Resend email service
- ✅ Created email Edge Function
- ✅ Built beautiful email templates
- ✅ Implemented email logging
- ✅ Tested thoroughly
- ✅ Ready for production

**Next Exercise**: Exercise 04 - Real-time Features

Keep up the great work! 🚀📧
