import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import { ForceBar } from "@/components/ForceBar";
import { PositionFilter, SearchBar } from "@/components/Filters";
import type { Position } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  player_id: string;
  name: string;
  positions: Position[];
  number: number | null;
  force: number | null;
  legend: boolean;
  squads: { sel: string; copa: number } | null;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { pos?: string; q?: string };
}) {
  const sb = supabasePublic();
  const { data, error } = await sb
    .from("players")
    .select(
      "id, player_id, name, positions, number, force, legend, squads:squad_id ( sel, copa )",
    )
    .order("force", { ascending: false, nullsFirst: false })
    .limit(2000);
  if (error) throw new Error(error.message);

  const pos = (searchParams.pos as Position | undefined) || undefined;
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const rows = (data as unknown as Row[]) ?? [];

  const filtered = rows.filter((r) => {
    if (pos && !r.positions.includes(pos)) return false;
    if (q) {
      const inName = r.name.toLowerCase().includes(q);
      const inSel = r.squads?.sel.toLowerCase().includes(q) ?? false;
      if (!inName && !inSel) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Ranking global de jogadores</h1>
        <p className="text-ink-300 text-sm">
          Todos os jogadores cadastrados, ordenados por força (modo clássico).
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-ink-700 bg-ink-900 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar placeholder="Buscar por jogador ou seleção..." />
        </div>
        <div>
          <div className="text-xs text-ink-400 mb-1">Filtrar por posição</div>
          <PositionFilter />
        </div>
      </section>

      <section className="rounded-lg border border-ink-700 bg-ink-900">
        <div className="overflow-x-auto scrollbar-pitch">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-400 text-xs uppercase tracking-wider">
              <tr className="border-b border-ink-700">
                <th className="px-4 py-2 w-12">#</th>
                <th className="px-4 py-2">Jogador</th>
                <th className="px-4 py-2">Seleção / Copa</th>
                <th className="px-4 py-2">Posições</th>
                <th className="px-4 py-2 w-56">Força</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-b border-ink-800 last:border-0 ${
                    r.legend ? "bg-pitch-900/20" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-mono text-ink-300 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {r.name}
                    {r.legend && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-pitch-200">
                        ★ LENDA
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {r.squads ? (
                      <Link
                        href={`/squad/${r.squads.sel}/${r.squads.copa}`}
                        className="text-pitch-300 hover:underline font-mono text-xs"
                      >
                        {r.squads.sel} · {r.squads.copa}
                      </Link>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.positions.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded bg-ink-700 text-ink-100 text-[10px] font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <ForceBar force={r.force} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-300">
                    Nenhum jogador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
