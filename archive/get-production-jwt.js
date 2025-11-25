#!/usr/bin/env node

/**
 * Get Production JWT Token
 * Signs in to production Supabase and returns JWT token
 */

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const PRODUCTION_URL = 'https://nfydvfhrepavcyclzfrh.supabase.co';
const PRODUCTION_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5meWR2ZmhyZXBhdmN5Y2x6ZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTkyMjUsImV4cCI6MjA3NzE5NTIyNX0.Pvu-mNu1B2MdLdQVA0kEwd-r-gv_Q8zkITCPMm9_LC4';

async function getProductionJWT() {
  console.log('🔐 Getting Production JWT Token...\n');

  const supabase = createClient(PRODUCTION_URL, PRODUCTION_ANON_KEY);

  try {
    // Try to sign in with test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@test.com',
      password: 'password123'
    });

    if (error) {
      console.error('❌ Sign in failed:', error.message);
      console.log('\n💡 You need to create this user in production first!');
      console.log('   Go to: https://supabase.com/dashboard/project/nfydvfhrepavcyclzfrh/auth/users');
      console.log('   Click "Add user" → "Create new user"');
      console.log('   Email: user@test.com');
      console.log('   Password: password123');
      console.log('   Auto Confirm User: Yes\n');
      process.exit(1);
    }

    console.log('✅ Successfully signed in to production!');
    console.log('👤 User:', data.user.email);
    console.log('\n🔑 Production JWT Token:');
    console.log(data.session.access_token);
    console.log('\n📋 Use this in your curl command:');
    console.log(`Authorization: Bearer ${data.session.access_token}`);
    console.log('\n⏰ Token expires at:', new Date(data.session.expires_at * 1000).toLocaleString());

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getProductionJWT();
