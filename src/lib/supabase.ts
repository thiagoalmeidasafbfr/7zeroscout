import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function need(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy .env.local.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function supabasePublic(): SupabaseClient {
  return createClient(need("NEXT_PUBLIC_SUPABASE_URL", url), need("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey), {
    auth: { persistSession: false },
  });
}

export function supabaseAdmin(): SupabaseClient {
  return createClient(need("NEXT_PUBLIC_SUPABASE_URL", url), need("SUPABASE_SERVICE_ROLE_KEY", serviceKey), {
    auth: { persistSession: false },
  });
}
