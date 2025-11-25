#!/usr/bin/env node

/**
 * Compare Anon Key vs JWT Token
 * Shows the difference between the two
 */

const jwt = require('jsonwebtoken');

console.log('🔍 Comparing Anon Key vs JWT Token\n');
console.log('='.repeat(70));

// Your anon key (what you're currently using)
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5meWR2ZmhyZXBhdmN5Y2x6ZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTkyMjUsImV4cCI6MjA3NzE5NTIyNX0.Pvu-mNu1B2MdLdQVA0kEwd-r-gv_Q8zkITCPMm9_LC4';

// Decode without verification (just to see contents)
const anonDecoded = jwt.decode(anonKey);

console.log('\n❌ ANON KEY (What you\'re using - WRONG):');
console.log(JSON.stringify(anonDecoded, null, 2));
console.log('\n⚠️  Notice:');
console.log('   - role: "anon" (not authenticated)');
console.log('   - No user information (no "sub", no "email")');
console.log('   - This is just an API key, not a user session');

console.log('\n' + '='.repeat(70));

// Get a real JWT token
const { createClient } = require('@supabase/supabase-js');

const PRODUCTION_URL = 'https://nfydvfhrepavcyclzfrh.supabase.co';
const PRODUCTION_ANON_KEY = anonKey;

async function showRealJWT() {
  const supabase = createClient(PRODUCTION_URL, PRODUCTION_ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@test.com',
    password: 'password123'
  });

  if (error) {
    console.log('\n❌ Could not sign in:', error.message);
    return;
  }

  const realJWT = data.session.access_token;
  const jwtDecoded = jwt.decode(realJWT);

  console.log('\n✅ REAL JWT TOKEN (What you SHOULD use):');
  console.log(JSON.stringify(jwtDecoded, null, 2));
  console.log('\n✅ Notice:');
  console.log('   - role: "authenticated" (user is signed in)');
  console.log('   - Has "sub" (user ID)');
  console.log('   - Has "email" (user email)');
  console.log('   - Has "exp" (expires in 1 hour)');
  console.log('   - This is a real user session token');

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 HOW TO FIX:');
  console.log('   1. Go to http://localhost:3000/login');
  console.log('   2. Sign in with: user@test.com / password123');
  console.log('   3. After signing in, your browser will have a real JWT');
  console.log('   4. Then try your payment form again');
  console.log('\n' + '='.repeat(70));
}

showRealJWT().catch(console.error);
