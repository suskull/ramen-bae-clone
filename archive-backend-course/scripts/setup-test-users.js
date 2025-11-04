#!/usr/bin/env node

/**
 * Script to create multiple test users with different roles
 * Usage: node scripts/setup-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const testUsers = [
  { email: 'admin@test.com', role: 'admin', name: 'Admin User' },
  { email: 'moderator@test.com', role: 'moderator', name: 'Moderator User' },
  { email: 'premium@test.com', role: 'premium', name: 'Premium User' },
  { email: 'user@test.com', role: 'user', name: 'Regular User' },
];

async function setupTestUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Setting up test users...\n');

  for (const testUser of testUsers) {
    try {
      console.log(`📧 Processing ${testUser.email}...`);

      // Check if user exists
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === testUser.email);

      let userId;

      if (existingUser) {
        console.log(`   ✅ User already exists`);
        userId = existingUser.id;
      } else {
        // Create user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: 'password123', // Default password for testing
          email_confirm: true
        });

        if (createError) {
          console.log(`   ❌ Error creating user: ${createError.message}`);
          continue;
        }

        console.log(`   ✅ Created new user`);
        userId = newUser.user.id;
      }

      // Update/create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: testUser.role,
          name: testUser.name,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.log(`   ❌ Error updating profile: ${profileError.message}`);
      } else {
        console.log(`   ✅ Set role to ${testUser.role}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('');
  }

  console.log('🎉 Test user setup complete!');
  console.log('\n📋 Test Accounts:');
  testUsers.forEach(user => {
    console.log(`   ${user.email} (${user.role}) - password: password123`);
  });
  
  console.log('\n🚀 You can now test different role access levels!');
}

setupTestUsers();