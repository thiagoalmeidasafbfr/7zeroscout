import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: {
      set: !!url,
      preview: url ? url.replace(/^(https?:\/\/[^.]+).*/, "$1...") : null,
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      set: !!anon,
      length: anon?.length ?? 0,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      set: !!service,
      length: service?.length ?? 0,
    },
  };

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  if (url && anon) {
    try {
      const sb = createClient(url, anon, { auth: { persistSession: false } });
      const { error, count } = await sb
        .from("squads")
        .select("*", { count: "exact", head: true });
      checks.public_select_squads = error
        ? { ok: false, detail: error.message }
        : { ok: true, detail: `rows=${count ?? "?"}` };
    } catch (err) {
      checks.public_select_squads = { ok: false, detail: (err as Error).message };
    }
  } else {
    checks.public_select_squads = { ok: false, detail: "skipped (url or anon key missing)" };
  }

  if (url && service) {
    try {
      const sb = createClient(url, service, { auth: { persistSession: false } });
      const { error } = await sb.from("squads").select("id").limit(1);
      checks.admin_select_squads = error
        ? { ok: false, detail: error.message }
        : { ok: true };
    } catch (err) {
      checks.admin_select_squads = { ok: false, detail: (err as Error).message };
    }
  } else {
    checks.admin_select_squads = { ok: false, detail: "skipped (url or service key missing)" };
  }

  return NextResponse.json({ env, checks });
}
