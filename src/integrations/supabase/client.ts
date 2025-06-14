
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mislxibukncnmvwhsiml.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc2x4aWJ1a25jbm12d2hzaW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODQ0NTYsImV4cCI6MjA2MzE2MDQ1Nn0.K7M9I0zJfbYhXZtHYqJVr3G8AzuLl1xOBpF0zjxZxro"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
