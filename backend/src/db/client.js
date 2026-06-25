import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is required.");
}

if (!supabaseServiceRoleKey && !supabaseAnonKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function requireSupabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for backend writes.");
  }
  return supabase;
}

export function normalizeSupabaseError(error) {
  if (!error) return null;
  const normalized = new Error(error.message || "Supabase request failed.");
  normalized.status = Number(error.status || error.code) || 500;
  normalized.details = error.details;
  normalized.hint = error.hint;
  return normalized;
}

export function throwIfSupabaseError(error) {
  const normalized = normalizeSupabaseError(error);
  if (normalized) throw normalized;
}
