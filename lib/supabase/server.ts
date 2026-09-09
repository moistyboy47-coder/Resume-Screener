import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Creates or retrieves the singleton server-side Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY if available for full server-side access,
 * falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      'Warning: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.'
    );
  }

  supabaseClientInstance = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClientInstance;
}

/**
 * Proxy singleton for ergonomic usage: `supabaseServer.from(...)`
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServerClient();
    return (client as any)[prop];
  },
});
