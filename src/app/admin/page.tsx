import { supabasePublic } from "@/lib/supabase";
import { AdminClient } from "./AdminClient";
import type { Player } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface AdminSquad {
  id: number;
  sel: string;
  copa: number;
  player_count: number;
  missing_force: number;
  players: Pick<Player, "id" | "player_id" | "name" | "force" | "positions" | "number" | "legend">[];
}

export default async function AdminPage() {
  const sb = supabasePublic();
  const { data: squads, error } = await sb
    .from("squads")
    .select("id, sel, copa")
    .order("sel", { ascending: true })
    .order("copa", { ascending: false });
  if (error) throw new Error(error.message);

  const ids = (squads ?? []).map((s) => s.id);
  let players: (Pick<Player, "id" | "player_id" | "name" | "force" | "positions" | "number" | "legend"> & { squad_id: number })[] = [];
  if (ids.length) {
    const { data, error: e2 } = await sb
      .from("players")
      .select("id, squad_id, player_id, name, positions, number, force, legend")
      .in("squad_id", ids);
    if (e2) throw new Error(e2.message);
    players = (data as typeof players) ?? [];
  }

  const byId = new Map<number, typeof players>();
  for (const p of players) {
    const arr = byId.get(p.squad_id) ?? [];
    arr.push(p);
    byId.set(p.squad_id, arr);
  }

  const items: AdminSquad[] = (squads ?? []).map((s) => {
    const list = byId.get(s.id) ?? [];
    return {
      id: s.id,
      sel: s.sel,
      copa: s.copa,
      player_count: list.length,
      missing_force: list.filter((p) => p.force == null).length,
      players: list,
    };
  });

  return <AdminClient squads={items} />;
}
