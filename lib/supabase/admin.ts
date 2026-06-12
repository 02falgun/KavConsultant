import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Server-side admin operations require the service role key.
    // Keeping a runtime-friendly error for missing configuration.
    process.env.SUPABASE_SERVICE_ROLE_KEY!,

    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
