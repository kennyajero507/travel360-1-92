
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gtwgyakeufqghnnmeovh.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0d2d5YWtldWZxZ2hubm1lb3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzAwNjgsImV4cCI6MjA2NTU0NjA2OH0.ygMAMIEPsUA-Kx0BXXWxhQTXGL2zLTYD1dP3AVIE2gI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
