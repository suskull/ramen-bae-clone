// Simple script to get JWT token for testing
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getJWTToken() {
  try {
    // Sign up a test user (or sign in if exists)
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })

    if (error && error.message.includes('already registered')) {
      // User exists, sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (signInError) {
        console.error('Sign in error:', signInError)
        return
      }
      
      console.log('JWT Token:', signInData.session.access_token)
      return
    }

    if (error) {
      console.error('Sign up error:', error)
      return
    }

    console.log('JWT Token:', data.session.access_token)
  } catch (err) {
    console.error('Error:', err)
  }
}

getJWTToken()