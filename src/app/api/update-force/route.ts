import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { UpdateForcePayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badRequest(msg: string, extra?: unknown) {
  return NextResponse.json({ error: msg, detail: extra }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let payload: UpdateForcePayload;
  try {
    payload = (await req.json()) as UpdateForcePayload;
  } catch {
    return badRequest("Corpo da requisição inválido (JSON esperado).");
  }

  if (!payload || typeof payload.sel !== "string" || !payload.sel.trim()) {
    return badRequest("Campo 'sel' obrigatório.");
  }
  if (typeof payload.copa !== "number" || !Number.isInteger(payload.copa)) {
    return badRequest("Campo 'copa' obrigatório (inteiro).");
  }
  if (!Array.isArray(payload.players)) {
    return badRequest("Campo 'players' deve ser um array.");
  }

  const sel = payload.sel.trim().toUpperCase();
  const sb = supabaseAdmin();

  const { data: squad, error: e1 } = await sb
    .from("squads")
    .select("id")
    .eq("sel", sel)
    .eq("copa", payload.copa)
    .maybeSingle();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (!squad) return NextResponse.json({ error: "Squad não encontrado." }, { status: 404 });

  const updates = payload.players
    .filter((p) => p && typeof p.playerId === "string")
    .map((p) => ({
      playerId: p.playerId,
      force:
        p.force === null
          ? null
          : typeof p.force === "number" && Number.isInteger(p.force) && p.force >= 1 && p.force <= 99
          ? p.force
          : undefined,
    }))
    .filter((p): p is { playerId: string; force: number | null } => p.force !== undefined);

  if (updates.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, note: "Nenhuma força válida no payload." });
  }

  let updated = 0;
  const errors: Array<{ playerId: string; error: string }> = [];
  for (const u of updates) {
    const { data, error } = await sb
      .from("players")
      .update({ force: u.force })
      .eq("squad_id", squad.id)
      .eq("player_id", u.playerId)
      .select("id");
    if (error) {
      errors.push({ playerId: u.playerId, error: error.message });
      continue;
    }
    if (data && data.length > 0) updated += 1;
  }

  return NextResponse.json({
    ok: errors.length === 0,
    updated,
    received: updates.length,
    errors: errors.length ? errors : undefined,
  });
}
