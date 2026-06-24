import { supabasePublic } from "@/lib/supabase";
import { SquadCard } from "@/components/SquadCard";
import { CopaFilter, PositionFilter, SearchBar } from "@/components/Filters";
import type { Player, Position } from "@/lib/types";

export const dynamic = "force-dynamic";

type Search = { pos?: string; copa?: string; q?: string };

interface SquadAgg {
  id: number;
  sel: string;
  copa: number;
  players: Player[];
}

async function fetchAllSquads(): Promise<SquadAgg[]> {
  const sb = supabasePublic();
  const { data: squads, error: e1 } = await sb
    .from("squads")
    .select("id, sel, copa")
    .order("copa", { ascending: false });
  if (e1) throw new Error(e1.message);
  if (!squads || squads.length === 0) return [];

  const ids = squads.map((s) => s.id);
  const { data: players, error: e2 } = await sb
    .from("players")
    .select("id, squad_id, player_id, name, positions, number, force, legend")
    .in("squad_id", ids);
  if (e2) throw new Error(e2.message);

  const byId = new Map<number, Player[]>();
  for (const p of (players as Player[]) ?? []) {
    if (!byId.has(p.squad_id)) byId.set(p.squad_id, []);
    byId.get(p.squad_id)!.push(p);
  }

  return squads.map((s) => ({
    id: s.id,
    sel: s.sel,
    copa: s.copa,
    players: byId.get(s.id) ?? [],
  }));
}

function avg(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const all = await fetchAllSquads();
  const pos = (searchParams.pos as Position | undefined) || undefined;
  const copa = searchParams.copa ? Number(searchParams.copa) : undefined;
  const q = (searchParams.q ?? "").trim().toLowerCase();

  const copas = Array.from(new Set(all.map((s) => s.copa))).sort((a, b) => b - a);

  const filtered = all
    .filter((s) => (copa ? s.copa === copa : true))
    .filter((s) => {
      if (!q) return true;
      if (s.sel.toLowerCase().includes(q)) return true;
      return s.players.some((p) => p.name.toLowerCase().includes(q));
    })
    .map((s) => {
      const players = pos ? s.players.filter((p) => p.positions.includes(pos)) : s.players;
      const rated = players.filter((p) => p.force != null) as (Player & { force: number })[];
      const sorted = [...rated].sort((a, b) => b.force - a.force);
      const a = avg(rated.map((p) => p.force));
      return {
        ...s,
        filteredPlayers: players,
        avgForce: a,
        ratedCount: rated.length,
        playerCount: players.length,
        strongest: sorted[0] ?? null,
        weakest: sorted[sorted.length - 1] ?? null,
      };
    })
    .filter((s) => s.playerCount > 0)
    .sort((a, b) => (b.avgForce ?? -1) - (a.avgForce ?? -1));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Elencos</h1>
        <p className="text-ink-300 text-sm">
          Ordenados pela força média do modo clássico (1–99).
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-ink-700 bg-ink-900 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar placeholder="Buscar por seleção ou jogador..." />
          <CopaFilter copas={copas} />
        </div>
        <div>
          <div className="text-xs text-ink-400 mb-1">Filtrar por posição</div>
          <PositionFilter />
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 p-10 text-center text-ink-300">
          Nenhum elenco encontrado. Importe um pelo{" "}
          <a href="/admin" className="text-pitch-300 underline">
            Admin
          </a>
          .
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SquadCard
              key={s.id}
              sel={s.sel}
              copa={s.copa}
              avgForce={s.avgForce}
              ratedCount={s.ratedCount}
              playerCount={s.playerCount}
              strongest={s.strongest ? { name: s.strongest.name, force: s.strongest.force } : null}
              weakest={s.weakest ? { name: s.weakest.name, force: s.weakest.force } : null}
            />
          ))}
        </section>
      )}
    </div>
  );
}
