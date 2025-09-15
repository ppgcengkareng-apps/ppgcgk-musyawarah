import { createClient } from '@supabase/supabase-js'

export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS
  
  return createClient(supabaseUrl, supabaseKey)
}