import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { POSITIONS } from "@/lib/constants";
import type { ImportPayload, Position } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidPosition(p: string): p is Position {
  return (POSITIONS as string[]).includes(p);
}

function badRequest(msg: string, extra?: unknown) {
  return NextResponse.json({ error: msg, detail: extra }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let payload: ImportPayload;
  try {
    payload = (await req.json()) as ImportPayload;
  } catch {
    return badRequest("Corpo da requisição inválido (JSON esperado).");
  }

  if (!payload || typeof payload.sel !== "string" || !payload.sel.trim()) {
    return badRequest("Campo 'sel' obrigatório.");
  }
  if (typeof payload.copa !== "number" || !Number.isInteger(payload.copa)) {
    return badRequest("Campo 'copa' obrigatório (inteiro).");
  }
  if (!Array.isArray(payload.squad)) {
    return badRequest("Campo 'squad' deve ser um array.");
  }

  const sel = payload.sel.trim().toUpperCase();
  const copa = payload.copa;
  const sb = supabaseAdmin();

  const { data: squadRow, error: e1 } = await sb
    .from("squads")
    .upsert({ sel, copa }, { onConflict: "sel,copa" })
    .select("id")
    .single();
  if (e1 || !squadRow) {
    return NextResponse.json({ error: "Falha ao salvar squad", detail: e1?.message }, { status: 500 });
  }

  const rows = payload.squad
    .filter((p) => p && typeof p.playerId === "string" && typeof p.name === "string")
    .map((p) => {
      const positions = Array.isArray(p.positions)
        ? p.positions.filter((x): x is string => typeof x === "string").filter(isValidPosition)
        : [];
      return {
        squad_id: squadRow.id,
        player_id: p.playerId,
        name: p.name,
        positions,
        number: typeof p.number === "number" ? p.number : null,
        legend: Boolean(p.legend),
      };
    });

  if (rows.length === 0) {
    return NextResponse.json({
      ok: true,
      squad_id: squadRow.id,
      inserted_or_updated: 0,
      note: "Nenhum jogador válido no payload.",
    });
  }

  const { data: upserted, error: e2 } = await sb
    .from("players")
    .upsert(rows, { onConflict: "squad_id,player_id", ignoreDuplicates: false })
    .select("id");

  if (e2) {
    return NextResponse.json({ error: "Falha ao salvar jogadores", detail: e2.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    squad_id: squadRow.id,
    sel,
    copa,
    inserted_or_updated: upserted?.length ?? rows.length,
  });
}
