# Deployment Troubleshooting Guide

Comprehensive troubleshooting guide for common deployment issues.

## 📋 Table of Contents

- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Stripe Payment Issues](#stripe-payment-issues)
- [Image Loading Issues](#image-loading-issues)
- [Performance Issues](#performance-issues)
- [Edge Function Issues](#edge-function-issues)
- [Environment Variable Issues](#environment-variable-issues)
- [Network and CORS Issues](#network-and-cors-issues)

---

## Build Issues

### ❌ Error: "Module not found: Can't resolve 'X'"

**Symptoms:**
```
Module not found: Can't resolve '@/components/ui/button'
```

**Causes:**
- Missing dependency
- Incorrect import path
- Cache issues

**Solutions:**

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules .next pnpm-lock.yaml
   pnpm install
   pnpm build
   ```

2. **Check import paths:**
   ```typescript
   // ❌ Wrong
   import { Button } from 'components/ui/button'
   
   // ✅ Correct
   import { Button } from '@/components/ui/button'
   ```

3. **Verify tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

4. **In Vercel, trigger rebuild:**
   ```bash
   vercel --prod --force
   ```

---

### ❌ Error: "Type error: Cannot find module"

**Symptoms:**
```
Type error: Cannot find module '@/lib/supabase/database.types'
```

**Causes:**
- Missing generated types
- Types not committed to git
- Types out of sync

**Solutions:**

1. **Generate types:**
   ```bash
   supabase gen types typescript --project-id your-ref > src/lib/supabase/database.types.ts
   ```

2. **Commit types to git:**
   ```bash
   git add src/lib/supabase/database.types.ts
   git commit -m "Update database types"
   git push
   ```

3. **Verify types exist in repository**

4. **Check .gitignore doesn't exclude types:**
   ```bash
   # Make sure this is NOT in .gitignore
   # src/lib/supabase/database.types.ts
   ```

---

### ❌ Error: "Build exceeded maximum duration"

**Symptoms:**
```
Error: Build exceeded maximum duration of 45 minutes
```

**Causes:**
- Large dependencies
- Slow build process
- Inefficient build configuration

**Solutions:**

1. **Optimize dependencies:**
   ```bash
   # Analyze bundle
   pnpm analyze
   
   # Remove unused dependencies
   pnpm remove unused-package
   ```

2. **Enable caching in Vercel:**
   - Vercel automatically caches `node_modules`
   - Ensure `pnpm-lock.yaml` is committed

3. **Optimize next.config.ts:**
   ```typescript
   const nextConfig: NextConfig = {
     experimental: {
       optimizePackageImports: ['lucide-react', 'date-fns'],
     },
   };
   ```

4. **Upgrade Vercel plan** if needed for longer build times

---

### ❌ Error: "Out of memory"

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Causes:**
- Large bundle size
- Memory-intensive build process
- Insufficient memory allocation

**Solutions:**

1. **Increase Node memory in package.json:**
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
     }
   }
   ```

2. **Optimize imports:**
   ```typescript
   // ❌ Imports entire library
   import * as Icons from 'lucide-react'
   
   // ✅ Tree-shakeable import
   import { ShoppingCart, User } from 'lucide-react'
   ```

3. **Enable SWC minification** (default in Next.js 16)

4. **Split large components** into smaller chunks

---

## Runtime Errors

### ❌ Error: "Failed to fetch" or "Network request failed"

**Symptoms:**
```
Error: Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**Causes:**
- Incorrect API URL
- CORS issues
- Environment variables not set

**Solutions:**

1. **Verify environment variables:**
   ```bash
   vercel env ls
   ```

2. **Check Supabase URL:**
   ```bash
   # Should be https://xxx.supabase.co
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Test API endpoint:**
   ```bash
   curl https://your-project.supabase.co/rest/v1/products \
     -H "apikey: your-anon-key"
   ```

4. **Check CORS in Supabase:**
   - Dashboard → Settings → API
   - Add your domain to allowed origins

---

### ❌ Error: "Hydration failed"

**Symptoms:**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Causes:**
- Server/client mismatch
- Using browser-only APIs during SSR
- Incorrect conditional rendering

**Solutions:**

1. **Use dynamic imports for client-only components:**
   ```typescript
   import dynamic from 'next/dynamic'
   
   const ClientComponent = dynamic(
     () => import('@/components/ClientComponent'),
     { ssr: false }
   )
   ```

2. **Check for browser-only code:**
   ```typescript
   // ❌ Wrong - runs on server
   const width = window.innerWidth
   
   // ✅ Correct - only runs on client
   const [width, setWidth] = useState(0)
   useEffect(() => {
     setWidth(window.innerWidth)
   }, [])
   ```

3. **Ensure consistent rendering:**
   ```typescript
   // ❌ Wrong - different on server/client
   <div>{new Date().toLocaleString()}</div>
   
   // ✅ Correct - consistent
   <div suppressHydrationWarning>
     {new Date().toLocaleString()}
   </div>
   ```

---

### ❌ Error: "Internal Server Error (500)"

**Symptoms:**
```
500 Internal Server Error
```

**Causes:**
- Unhandled exception in API route
- Database connection error
- Missing environment variables

**Solutions:**

1. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

2. **Add error handling to API routes:**
   ```typescript
   export async function GET(request: Request) {
     try {
       // Your code
       return Response.json({ data })
     } catch (error) {
       console.error('API Error:', error)
       return Response.json(
         { error: 'Internal server error' },
         { status: 500 }
       )
     }
   }
   ```

3. **Verify database connection:**
   ```bash
   supabase db ping
   ```

4. **Check environment variables are set in Vercel**

---

## Database Issues

### ❌ Error: "relation 'table_name' does not exist"

**Symptoms:**
```
error: relation "products" does not exist
```

**Causes:**
- Migrations not applied to production
- Wrong database connected
- Table name mismatch

**Solutions:**

1. **Push migrations to production:**
   ```bash
   supabase db push
   ```

2. **Verify connection:**
   ```bash
   # Check which project you're linked to
   supabase status
   ```

3. **Check table exists:**
   ```sql
   -- In Supabase SQL Editor
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

4. **Verify table name in code matches database:**
   ```typescript
   // Check your queries
   const { data } = await supabase
     .from('products') // Must match exact table name
     .select('*')
   ```

---

### ❌ Error: "new row violates row-level security policy"

**Symptoms:**
```
new row violates row-level security policy for table "products"
```

**Causes:**
- RLS policy too restrictive
- Missing authentication
- Incorrect user context

**Solutions:**

1. **Check RLS policies in Supabase Dashboard:**
   - Database → Tables → Select table → Policies

2. **Verify authentication:**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   console.log('Current user:', user)
   ```

3. **Test policy with SQL:**
   ```sql
   -- Test as authenticated user
   SET LOCAL role TO authenticated;
   SET LOCAL request.jwt.claims TO '{"sub": "user-id"}';
   
   INSERT INTO products (name, price) 
   VALUES ('Test', 9.99);
   ```

4. **Update policy if needed:**
   ```sql
   -- Allow authenticated users to insert
   CREATE POLICY "Users can insert products"
   ON products FOR INSERT
   TO authenticated
   WITH CHECK (true);
   ```

5. **For admin operations, use service role:**
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only!
   )
   ```

---

### ❌ Error: "Connection timeout"

**Symptoms:**
```
Error: Connection timeout
```

**Causes:**
- Database overloaded
- Network issues
- Connection pool exhausted

**Solutions:**

1. **Check Supabase status:**
   - https://status.supabase.com

2. **Monitor database performance:**
   - Supabase Dashboard → Reports

3. **Optimize queries:**
   ```typescript
   // ❌ N+1 query problem
   const products = await supabase.from('products').select('*')
   for (const product of products.data) {
     const reviews = await supabase
       .from('reviews')
       .eq('product_id', product.id)
   }
   
   // ✅ Single query with join
   const { data } = await supabase
     .from('products')
     .select('*, reviews(*)')
   ```

4. **Add database indexes:**
   ```sql
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_reviews_product ON reviews(product_id);
   ```

5. **Upgrade Supabase plan** if needed

---

## Authentication Issues

### ❌ Error: "Invalid login credentials"

**Symptoms:**
```
AuthApiError: Invalid login credentials
```

**Causes:**
- Wrong email/password
- User doesn't exist
- Email not confirmed

**Solutions:**

1. **Check user exists in Supabase:**
   - Dashboard → Authentication → Users

2. **Verify email confirmation:**
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password',
     options: {
       emailRedirectTo: `${window.location.origin}/auth/callback`
     }
   })
   ```

3. **Check email confirmation settings:**
   - Dashboard → Authentication → Settings
   - "Enable email confirmations"

4. **Resend confirmation email:**
   ```typescript
   await supabase.auth.resend({
     type: 'signup',
     email: 'user@example.com'
   })
   ```

---

### ❌ Error: "Auth session missing"

**Symptoms:**
```
Error: Auth session missing!
```

**Causes:**
- User not logged in
- Session expired
- Cookie issues

**Solutions:**

1. **Check session:**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Session:', session)
   ```

2. **Refresh session:**
   ```typescript
   const { data, error } = await supabase.auth.refreshSession()
   ```

3. **Verify cookies are enabled** in browser

4. **Check redirect URLs in Supabase:**
   - Dashboard → Authentication → URL Configuration
   - Add: `https://yourdomain.com/auth/callback`

5. **Implement session refresh:**
   ```typescript
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         if (event === 'TOKEN_REFRESHED') {
           console.log('Token refreshed')
         }
       }
     )
     
     return () => subscription.unsubscribe()
   }, [])
   ```

---

### ❌ Error: "Email link is invalid or has expired"

**Symptoms:**
```
Email link is invalid or has expired
```

**Causes:**
- Link expired (default 1 hour)
- Link already used
- Wrong redirect URL

**Solutions:**

1. **Request new link:**
   ```typescript
   await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${window.location.origin}/auth/reset-password`
   })
   ```

2. **Increase link expiry** (Supabase Dashboard):
   - Authentication → Settings
   - "Email link expiry" → Set to desired duration

3. **Verify redirect URL matches:**
   ```typescript
   // Must match URL in Supabase settings
   const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
   ```

---

## Stripe Payment Issues

### ❌ Error: "Invalid API key"

**Symptoms:**
```
StripeAuthenticationError: Invalid API Key provided
```

**Causes:**
- Using test key in production
- Wrong key format
- Key not set in environment

**Solutions:**

1. **Verify using live keys in production:**
   ```bash
   # Check environment variables
   vercel env ls
   
   # Should be:
   # STRIPE_SECRET_KEY=sk_live_...
   # NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

2. **Get live keys from Stripe:**
   - Dashboard → Developers → API keys
   - Toggle "Viewing test data" OFF

3. **Update environment variables:**
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   # Enter: sk_live_your_key
   
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   # Enter: pk_live_your_key
   ```

4. **Redeploy:**
   ```bash
   vercel --prod --force
   ```

---

### ❌ Error: "No such customer"

**Symptoms:**
```
StripeInvalidRequestError: No such customer: 'cus_xxx'
```

**Causes:**
- Customer ID from test mode used in live mode
- Customer doesn't exist
- Wrong Stripe account

**Solutions:**

1. **Verify Stripe mode:**
   ```typescript
   // Check which key is being used
   console.log('Stripe key:', process.env.STRIPE_SECRET_KEY?.substring(0, 10))
   // Should be: sk_live_... for production
   ```

2. **Create customer in correct mode:**
   ```typescript
   const customer = await stripe.customers.create({
     email: user.email,
     metadata: {
       supabase_user_id: user.id
     }
   })
   ```

3. **Check Stripe Dashboard mode:**
   - Toggle "Viewing test data" to match your environment

---

### ❌ Error: "Invalid webhook signature"

**Symptoms:**
```
Error: No signatures found matching the expected signature for payload
```

**Causes:**
- Wrong webhook secret
- Webhook secret from test mode
- Request body modified

**Solutions:**

1. **Get correct webhook secret:**
   - Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - Copy "Signing secret"

2. **Update environment variable:**
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET production
   # Enter: whsec_your_secret
   ```

3. **Verify webhook endpoint:**
   ```typescript
   // app/api/webhooks/stripe/route.ts
   const signature = headers().get('stripe-signature')!
   
   try {
     const event = stripe.webhooks.constructEvent(
       body,
       signature,
       process.env.STRIPE_WEBHOOK_SECRET!
     )
     // Process event
   } catch (err) {
     console.error('Webhook signature verification failed:', err)
     return Response.json({ error: 'Invalid signature' }, { status: 400 })
   }
   ```

4. **Test webhook:**
   ```bash
   stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe
   stripe trigger checkout.session.completed
   ```

---

### ❌ Error: "Payment requires confirmation"

**Symptoms:**
```
The payment requires additional action before it can be completed
```

**Causes:**
- 3D Secure authentication required
- Card requires verification
- Missing payment confirmation

**Solutions:**

1. **Implement payment confirmation:**
   ```typescript
   const { error } = await stripe.confirmCardPayment(
     clientSecret,
     {
       payment_method: {
         card: cardElement,
         billing_details: { name: 'Customer Name' }
       }
     }
   )
   ```

2. **Handle 3D Secure:**
   ```typescript
   if (error) {
     if (error.type === 'card_error') {
       // Show error to user
       setError(error.message)
     }
   } else {
     // Payment succeeded
     router.push('/order-confirmation')
   }
   ```

3. **Test with 3D Secure test cards:**
   - `4000002500003155` - Requires authentication
   - `4242424242424242` - No authentication

---

## Image Loading Issues

### ❌ Error: "Invalid src prop"

**Symptoms:**
```
Error: Invalid src prop on `next/image`
```

**Causes:**
- Image URL not in remotePatterns
- Invalid image URL
- Missing protocol

**Solutions:**

1. **Add domain to next.config.ts:**
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '*.supabase.co',
         pathname: '/storage/v1/object/public/**',
       },
     ],
   }
   ```

2. **Verify image URL format:**
   ```typescript
   // ✅ Correct
   const imageUrl = 'https://xxx.supabase.co/storage/v1/object/public/products/image.jpg'
   
   // ❌ Wrong - missing protocol
   const imageUrl = 'xxx.supabase.co/storage/v1/object/public/products/image.jpg'
   ```

3. **Redeploy after config change:**
   ```bash
   vercel --prod --force
   ```

---

### ❌ Images not loading from Supabase Storage

**Symptoms:**
- Images work locally but not in production
- 403 Forbidden errors

**Causes:**
- Storage bucket not public
- RLS policy blocking access
- CORS issues

**Solutions:**

1. **Make bucket public:**
   - Supabase Dashboard → Storage
   - Select bucket → Settings
   - Enable "Public bucket"

2. **Add RLS policy for public read:**
   ```sql
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'product-images');
   ```

3. **Verify image URL:**
   ```bash
   curl -I https://xxx.supabase.co/storage/v1/object/public/products/image.jpg
   # Should return 200 OK
   ```

4. **Check CORS settings:**
   - Supabase Dashboard → Settings → API
   - Add your domain to allowed origins

---

## Performance Issues

### ❌ Slow page loads

**Symptoms:**
- Pages take >3 seconds to load
- Poor Lighthouse scores

**Solutions:**

1. **Enable ISR for static pages:**
   ```typescript
   // app/products/[id]/page.tsx
   export const revalidate = 3600 // Revalidate every hour
   ```

2. **Optimize images:**
   ```typescript
   <Image
     src={imageUrl}
     alt="Product"
     width={400}
     height={400}
     quality={85}
     priority={isAboveFold}
   />
   ```

3. **Implement lazy loading:**
   ```typescript
   import dynamic from 'next/dynamic'
   
   const Reviews = dynamic(() => import('@/components/Reviews'), {
     loading: () => <ReviewsSkeleton />
   })
   ```

4. **Add database indexes:**
   ```sql
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_products_created ON products(created_at DESC);
   ```

5. **Use React Query caching:**
   ```typescript
   const { data } = useQuery({
     queryKey: ['products'],
     queryFn: fetchProducts,
     staleTime: 5 * 60 * 1000, // 5 minutes
   })
   ```

---

### ❌ High database load

**Symptoms:**
- Slow queries
- Connection timeouts
- High CPU usage in Supabase

**Solutions:**

1. **Optimize queries:**
   ```typescript
   // ❌ Fetching unnecessary data
   const { data } = await supabase
     .from('products')
     .select('*')
   
   // ✅ Select only needed columns
   const { data } = await supabase
     .from('products')
     .select('id, name, price, image_url')
   ```

2. **Add pagination:**
   ```typescript
   const { data } = await supabase
     .from('products')
     .select('*')
     .range(0, 19) // First 20 items
   ```

3. **Use connection pooling** (automatic in Supabase)

4. **Monitor slow queries:**
   - Supabase Dashboard → Reports → Slow Queries

5. **Consider upgrading Supabase plan**

---

## Edge Function Issues

### ❌ Error: "Worker failed to boot"

**Symptoms:**
```
Worker failed to boot: SyntaxError: Unexpected token
```

**Causes:**
- Using outdated Deno patterns
- Syntax errors
- Wrong import URLs

**Solutions:**

1. **Use current Deno.serve pattern:**
   ```typescript
   // ✅ Correct - current pattern
   Deno.serve(async (req) => {
     // Your code
   })
   
   // ❌ Wrong - outdated
   import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
   serve(async (req) => { ... })
   ```

2. **Use current library versions:**
   ```typescript
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   import Stripe from 'https://esm.sh/stripe@14.0.0'
   ```

3. **Check syntax errors:**
   ```bash
   # Test locally first
   supabase functions serve function-name
   ```

---

### ❌ Error: "Function timeout"

**Symptoms:**
```
Error: Function execution timed out
```

**Causes:**
- Long-running operation
- Infinite loop
- Slow external API

**Solutions:**

1. **Optimize function code:**
   ```typescript
   // ❌ Slow - sequential
   const user = await getUser()
   const products = await getProducts()
   
   // ✅ Fast - parallel
   const [user, products] = await Promise.all([
     getUser(),
     getProducts()
   ])
   ```

2. **Add timeout handling:**
   ```typescript
   const controller = new AbortController()
   const timeout = setTimeout(() => controller.abort(), 25000) // 25s
   
   try {
     const response = await fetch(url, { signal: controller.signal })
   } finally {
     clearTimeout(timeout)
   }
   ```

3. **Move long operations to background jobs**

---

## Environment Variable Issues

### ❌ Error: "Environment variable not found"

**Symptoms:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**Causes:**
- Variable not set in Vercel
- Wrong variable name
- Variable not prefixed with NEXT_PUBLIC_ for client-side

**Solutions:**

1. **List all variables:**
   ```bash
   vercel env ls
   ```

2. **Add missing variable:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   ```

3. **Verify variable names match:**
   ```typescript
   // Must match exactly
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL
   ```

4. **Remember client vs server variables:**
   ```typescript
   // ✅ Client-side - needs NEXT_PUBLIC_ prefix
   const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   
   // ✅ Server-side - no prefix needed
   const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY
   ```

5. **Redeploy after adding variables:**
   ```bash
   vercel --prod --force
   ```

---

## Network and CORS Issues

### ❌ Error: "CORS policy blocked"

**Symptoms:**
```
Access to fetch at 'https://xxx.supabase.co' has been blocked by CORS policy
```

**Causes:**
- Domain not in Supabase allowed origins
- Missing CORS headers
- Preflight request failing

**Solutions:**

1. **Add domain to Supabase:**
   - Dashboard → Settings → API
   - Add to "Additional Allowed Origins":
     - `https://yourdomain.com`
     - `https://www.yourdomain.com`

2. **Add CORS headers to API routes:**
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }
   
   export async function OPTIONS(request: Request) {
     return new Response('ok', { headers: corsHeaders })
   }
   
   export async function POST(request: Request) {
     // Your code
     return Response.json(data, { headers: corsHeaders })
   }
   ```

3. **Test CORS:**
   ```bash
   curl -X OPTIONS https://yourdomain.com/api/endpoint \
     -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

---

## Getting Help

### Before Asking for Help

1. **Check logs:**
   ```bash
   vercel logs --follow
   supabase functions logs function-name
   ```

2. **Verify environment:**
   ```bash
   vercel env ls
   supabase status
   ```

3. **Test locally:**
   ```bash
   pnpm build
   pnpm start
   ```

4. **Check service status:**
   - https://www.vercel-status.com
   - https://status.supabase.com
   - https://status.stripe.com

### When Asking for Help

Include:
- Error message (full stack trace)
- Steps to reproduce
- Environment (production/preview)
- Recent changes
- Relevant logs

### Support Channels

- [Vercel Support](https://vercel.com/support)
- [Supabase Support](https://supabase.com/support)
- [Stripe Support](https://support.stripe.com)

---

**Still stuck?** Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md) or [Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)
