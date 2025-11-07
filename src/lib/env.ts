/**
 * Environment Variables Configuration
 * 
 * This file provides type-safe access to environment variables
 * and validates that all required variables are present.
 */

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

// Optional but recommended
const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
] as const;

/**
 * Validate that all required environment variables are present
 * Throws an error if any are missing
 */
export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease check your .env.local file.`
    );
  }

  // Warn about missing optional variables
  const missingOptional = optionalEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missingOptional.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Missing optional environment variables:\n${missingOptional.map(k => `  - ${k}`).join('\n')}`
    );
  }
}

/**
 * Type-safe environment variables
 * Use this instead of process.env directly
 */
export const env = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Resend (Email)
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
  },

  // Application
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Feature flags
  features: {
    enablePayments: !!process.env.STRIPE_SECRET_KEY,
    enableEmail: !!process.env.RESEND_API_KEY,
  },
} as const;

/**
 * Check if running in production
 */
export const isProduction = env.app.nodeEnv === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.app.nodeEnv === 'development';

/**
 * Check if using local Supabase
 */
export const isLocalSupabase = env.supabase.url.includes('127.0.0.1') || env.supabase.url.includes('localhost');

/**
 * Get current environment name
 */
export function getEnvironmentName(): 'local' | 'production' | 'development' {
  if (isLocalSupabase) return 'local';
  if (isProduction) return 'production';
  return 'development';
}

// Validate on import (only in Node.js environment)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
