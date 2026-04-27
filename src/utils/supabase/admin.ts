import { createClient, SupabaseClient } from '@supabase/supabase-js'

// P2-3: Singleton — tạo 1 lần per server process, không tạo mới mỗi lần gọi
let _adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;
  
  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  return _adminClient;
}
