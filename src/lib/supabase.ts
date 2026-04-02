import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
// Dùng Service Role Key khi chạy trên backend (vượt RLS)
const isServer = typeof window === 'undefined'
const finalKey = isServer ? (process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey) : supabaseAnonKey

export const supabase = createClient(supabaseUrl, finalKey)
