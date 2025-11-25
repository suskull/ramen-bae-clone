/**
 * Common CORS utility for all Edge Functions
 * This file can be imported by any Edge Function to handle CORS consistently
 */

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',           // Local development
    'http://localhost:3001',           // Alternative local port
    'http://127.0.0.1:3000',           // Alternative localhost
    'https://yourdomain.com',          // Your production domain (replace with actual)
    'https://www.yourdomain.com',      // WWW version (replace with actual)
    'https://yourapp.vercel.app',      // Vercel deployment (replace with actual)
    // Add your actual production domains here
];

/**
 * Get CORS headers based on the request origin
 */
export function getCorsHeaders(origin: string | null) {
    const isAllowed = origin && allowedOrigins.includes(origin);

    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Credentials': 'true',
    };
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    return null; // Not a preflight request
}

/**
 * Create a response with CORS headers
 */
export function createCorsResponse(
    body: any,
    options: { status?: number; headers?: Record<string, string> } = {},
    origin: string | null = null
): Response {
    const corsHeaders = getCorsHeaders(origin);

    return new Response(
        typeof body === 'string' ? body : JSON.stringify(body),
        {
            status: options.status || 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        }
    );
}

/**
 * Environment-based CORS configuration
 * More permissive in development, strict in production
 */
export function getEnvironmentCorsHeaders(origin: string | null) {
    const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

    if (isDevelopment) {
        // Allow all localhost origins in development
        const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1');
        return {
            'Access-Control-Allow-Origin': isLocalhost ? origin : 'null',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Credentials': 'true',
        };
    }

    // Production: strict origin checking
    return getCorsHeaders(origin);
}