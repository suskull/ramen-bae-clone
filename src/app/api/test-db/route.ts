import { NextResponse } from 'next/server'
import { testSupabaseConnection } from '@/lib/supabase/test-connection'

export async function GET() {
  const result = await testSupabaseConnection()
  
  if (result.success) {
    return NextResponse.json({
      message: 'Supabase connection successful!',
      ...result
    })
  } else {
    return NextResponse.json(
      {
        message: 'Supabase connection failed',
        error: result.error
      },
      { status: 500 }
    )
  }
}
