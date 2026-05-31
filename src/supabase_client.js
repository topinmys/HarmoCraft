import { createClient } from '@supabase/supabase-js'

console.log(import.meta.env)

export const supabase = createClient(import.meta.env.VITE_SUPA_URL, import.meta.env.VITE_SUPA_API)