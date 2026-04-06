import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Khi thiếu URL/key (vd: Docker không truyền env), không gọi createClient để tránh throw → app vẫn render, chỉ không dùng được đăng nhập/Supabase
const noop = () => {}
const noopSub = { unsubscribe: noop }
const mockAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: noopSub } }),
  signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
  signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
  signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
  signOut: () => Promise.resolve({ error: null }),
}
const notConfigured = { message: 'Supabase chưa cấu hình' }
const mockFrom = () => ({
  select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
  insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: notConfigured }) }) }),
  delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
  update: () => ({ eq: () => Promise.resolve({ error: null }) }),
})
const mockSupabase = { auth: mockAuth, from: mockFrom }

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabase
