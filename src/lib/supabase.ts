import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SERVICES_KEY || "";

/**
 * Standard Supabase client instance for client and public browser actions.
 */
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey || "dummy-anon-key-placeholder");
  }
  return clientInstance;
}

export const supabase = getSupabaseClient();

/**
 * Admin Supabase client instance with elevated service_role privileges for server-side operations.
 */
let adminInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseUrl) return null;
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!key) return null;
  if (!adminInstance) {
    adminInstance = createClient(supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminInstance;
}

/**
 * Build direct OAuth authorization URL for Google authentication via Supabase Auth.
 * Supabase handles the Google Cloud OAuth redirect and delivers credentials
 */
export function getSupabaseGoogleAuthUrl(finalRedirectPath = "/account"): string {
  const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const appCallbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(finalRedirectPath)}`;

  return `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(appCallbackUrl)}`;
}
