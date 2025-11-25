#!/usr/bin/env node

/**
 * Debug Environment Configuration
 * Helps identify environment variable issues
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Configuration Debug\n');
console.log('=' .repeat(60));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

console.log('\n📍 Supabase Configuration:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseAnonKey?.substring(0, 20)}...`);

if (supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost')) {
  console.log('   ✅ Using LOCAL Supabase');
} else if (supabaseUrl?.includes('supabase.co')) {
  console.log('   ⚠️  Using PRODUCTION Supabase');
} else {
  console.log('   ❌ Invalid or missing Supabase URL');
}

console.log('\n💳 Stripe Configuration:');
console.log(`   Secret Key: ${stripeSecretKey?.substring(0, 20)}...`);
console.log(`   Public Key: ${stripePublicKey?.substring(0, 20)}...`);

if (stripeSecretKey?.startsWith('sk_test_')) {
  console.log('   ✅ Using TEST mode');
} else if (stripeSecretKey?.startsWith('sk_live_')) {
  console.log('   ⚠️  Using LIVE mode');
} else {
  console.log('   ❌ Invalid or missing Stripe key');
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Tips:');
console.log('   - For local testing, use local Supabase URL and anon key');
console.log('   - Restart your Next.js dev server after changing .env.local');
console.log('   - Sign in again after switching environments');
console.log('   - Use test Stripe keys for development\n');
