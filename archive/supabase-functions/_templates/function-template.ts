import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, createCorsResponse } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  const origin = req.headers.get('origin');

  try {
    // Get auth header (JWT verification is handled by Supabase)
    const authHeader = req.headers.get('Authorization');

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // Get user info (optional - JWT is already verified by Supabase)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse request body
    const body = await req.json();

    // YOUR FUNCTION LOGIC HERE
    const result = {
      message: 'Function executed successfully',
      user: user?.email || 'anonymous',
      data: body,
    };

    // Return JSON response with CORS
    return createCorsResponse(result, { status: 200 }, origin);

  } catch (error) {
    // Handle errors with CORS
    return createCorsResponse(
      {
        error: 'Function execution failed',
        message: error.message
      },
      { status: 500 },
      origin
    );
  }
});