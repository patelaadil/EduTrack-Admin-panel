import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lsmvpbdpwbfsedgzbhty.supabase.co'
const SUPABASE_KEY = 'sb_publishable_GhelLLB5VhjNopshJMZiyw_XwiXAvPP'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
