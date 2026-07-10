import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client met de service-role key. Wordt gebruikt voor
 * leads, chatbot en het admin-panel; RLS blijft dicht voor de buitenwereld.
 * Zonder env-vars geeft dit null terug zodat de site gewoon blijft werken
 * (zelfde patroon als isSupabaseConfigured elders).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
