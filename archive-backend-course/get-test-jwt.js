#!/usr/bin/env node

/**
 * Get JWT token for testing Edge Functions
 * Usage: node get-test-jwt.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getTestJWT() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Sign in with test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@test.com',
      password: 'password123'
    });

    if (error) {
      throw error;
    }

    console.log('✅ Successfully signed in!');
    console.log('🔑 JWT Token:');
    console.log(data.session.access_token);
    console.log('\n📋 Use this token in your curl command:');
    console.log(`Authorization: Bearer ${data.session.access_token}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getTestJWT();