import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://lsmvpbdpwbfsedgzbhty.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbXZwYmRwd2Jmc2VkZ3piaHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTAyMjAsImV4cCI6MjA4ODg2NjIyMH0.7V9STiTmRr8vhMu3UdQ0be6ElO69Swt4L70EsgW2MTM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)