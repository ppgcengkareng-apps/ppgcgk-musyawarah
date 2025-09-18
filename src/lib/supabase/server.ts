import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl)
  console.log('Using service role key:', supabaseKey ? 'Present' : 'Missing')
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}