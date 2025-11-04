#!/usr/bin/env node

/**
 * Complete Test Users Setup Script
 * Creates users in both auth.users and public.profiles properly
 * 
 * Usage: node scripts/setup-test-users-v2.js
 * 
 * Requirements:
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - npm install @supabase/supabase-js dotenv
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const testUsers = [
  { 
    email: 'superadmin@test.com', 
    password: 'password123',
    role: 'super_admin', 
    name: 'Super Admin User' 
  },
  { 
    email: 'admin@test.com', 
    password: 'password123',
    role: 'admin', 
    name: 'Admin User' 
  },
  { 
    email: 'moderator@test.com', 
    password: 'password123',
    role: 'moderator', 
    name: 'Moderator User' 
  },
  { 
    email: 'premium@test.com', 
    password: 'password123',
    role: 'premium', 
    name: 'Premium User' 
  },
  { 
    email: 'user@test.com', 
    password: 'password123',
    role: 'user', 
    name: 'Regular User' 
  },
];

async function setupTestUsers() {
  console.log('🚀 Starting test user setup...\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.log('\nRequired in .env.local:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=your-project-url');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('\nGet service role key from: Supabase Dashboard → Settings → API');
    process.exit(1);
  }

  // Create admin client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Connected to Supabase\n');

  // Track results
  const results = {
    created: [],
    updated: [],
    failed: [],
  };

  for (const testUser of testUsers) {
    console.log(`\n📧 Processing ${testUser.email}...`);
    
    try {
      // Step 1: Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === testUser.email);

      let userId;

      if (existingUser) {
        console.log(`   ℹ️  User already exists in auth.users`);
        userId = existingUser.id;
        results.updated.push(testUser.email);
      } else {
        // Step 2: Create user in auth.users
        console.log(`   🔨 Creating user in auth.users...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            name: testUser.name
          }
        });

        if (createError) {
          throw new Error(`Failed to create auth user: ${createError.message}`);
        }

        userId = newUser.user.id;
        console.log(`   ✅ Created auth user (ID: ${userId})`);
        results.created.push(testUser.email);
      }

      // Step 3: Create or update profile
      console.log(`   🔨 Setting up profile...`);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: testUser.role,
          name: testUser.name,
          email: testUser.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log(`   ✅ Profile set with role: ${testUser.role}`);

      // Step 4: Verify the setup
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .single();

      if (profile) {
        console.log(`   ✅ Verified: ${profile.name} (${profile.role})`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed.push({ email: testUser.email, error: error.message });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SETUP SUMMARY');
  console.log('='.repeat(60));
  
  if (results.created.length > 0) {
    console.log(`\n✅ Created ${results.created.length} new users:`);
    results.created.forEach(email => console.log(`   - ${email}`));
  }
  
  if (results.updated.length > 0) {
    console.log(`\n🔄 Updated ${results.updated.length} existing users:`);
    results.updated.forEach(email => console.log(`   - ${email}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed ${results.failed.length} users:`);
    results.failed.forEach(({ email, error }) => console.log(`   - ${email}: ${error}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SETUP COMPLETE!');
  console.log('='.repeat(60));
  
  console.log('\n📋 Test Accounts (all passwords: password123):');
  testUsers.forEach(user => {
    console.log(`   ${user.email.padEnd(25)} → ${user.role}`);
  });
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Login with any test account');
  console.log('   2. Visit /admin/users to see all users');
  console.log('   3. Test different role access levels');
  console.log('   4. Visit /role-demo to see role-based content\n');
}

// Run the setup
setupTestUsers().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
