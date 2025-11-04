/// <reference types="https://deno.land/x/deno@v1.28.0/lib/deno.d.ts" />
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, createCorsResponse } from '../_shared/cors.ts';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Maximum requests per window

// Database-based rate limiting function
async function checkRateLimit(supabase: any, clientIP: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);
  
  try {
    // First, clean up old entries (older than 1 minute)
    await supabase
      .from('rate_limits')
      .delete()
      .lt('created_at', windowStart.toISOString());

    // Count current requests for this IP in the current window
    const { data: existingRequests, error: countError } = await supabase
      .from('rate_limits')
      .select('id')
      .eq('client_ip', clientIP)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      console.error('Rate limit count error:', countError);
      // If we can't check rate limits, allow the request (fail open)
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - 1,
        resetTime: now.getTime() + RATE_LIMIT_WINDOW
      };
    }

    const currentCount = existingRequests?.length || 0;

    // Check if limit exceeded
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now.getTime() + RATE_LIMIT_WINDOW
      };
    }

    // Record this request
    const { error: insertError } = await supabase
      .from('rate_limits')
      .insert({
        client_ip: clientIP,
        created_at: now.toISOString()
      });

    if (insertError) {
      console.error('Rate limit insert error:', insertError);
      // If we can't record the request, allow it (fail open)
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1,
        resetTime: now.getTime() + RATE_LIMIT_WINDOW
      };
    }

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1,
      resetTime: now.getTime() + RATE_LIMIT_WINDOW
    };

  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request (fail open)
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now.getTime() + RATE_LIMIT_WINDOW
    };
  }
}

serve(async (req) => {
  console.log(`🚀 Function called with method: ${req.method}`);

  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log('✅ Preflight request handled, returning CORS headers');
    return corsResponse;
  }

  console.log('📝 Processing actual request...');
  const origin = req.headers.get('origin');

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  
  console.log(`🔍 Client IP: ${clientIP}`);

  // Create Supabase client for rate limiting (use service role for database operations)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Check rate limit
  const rateLimitResult = await checkRateLimit(supabase, clientIP);
  
  if (!rateLimitResult.allowed) {
    console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
    
    const resetTimeSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    
    return createCorsResponse(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${resetTimeSeconds} seconds.`,
        retryAfter: resetTimeSeconds,
        limit: RATE_LIMIT_MAX_REQUESTS,
        window: RATE_LIMIT_WINDOW / 1000 // Convert to seconds
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          'Retry-After': resetTimeSeconds.toString()
        }
      },
      origin
    );
  }

  console.log(`✅ Rate limit check passed. Remaining: ${rateLimitResult.remaining}`);

  try {
    // Get auth header (JWT verification is handled by Supabase)
    const authHeader = req.headers.get('Authorization');

    // Create Supabase client for user operations
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321',
      Deno.env.get('SUPABASE_ANON_KEY') ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Get user info (optional - JWT is already verified by Supabase)
    const { data: { user } } = await userSupabase.auth.getUser();

    // Parse request body
    const { name } = await req.json();

    // Create response data
    const data = {
      message: `Hello ${name || 'World'}!`,
      timestamp: new Date().toISOString(),
      method: req.method,
      authenticated: !!user,
      userRole: user?.role || 'anonymous',
      clientIP: clientIP,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        limit: RATE_LIMIT_MAX_REQUESTS,
        resetTime: new Date(rateLimitResult.resetTime).toISOString()
      }
    };

    // Return JSON response with CORS and rate limit headers
    return createCorsResponse(
      data, 
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
        }
      }, 
      origin
    );

  } catch (error) {
    // Handle errors with CORS
    return createCorsResponse(
      {
        error: 'Invalid request',
        message: error.message
      },
      { status: 400 },
      origin
    );
  }
});