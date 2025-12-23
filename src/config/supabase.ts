import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다!')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase 클라이언트 초기화 완료')
