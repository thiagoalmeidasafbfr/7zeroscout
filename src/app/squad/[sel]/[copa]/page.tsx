import { supabasePublic } from "@/lib/supabase";
import { ForceBar } from "@/components/ForceBar";
import { SelBadge } from "@/components/SelBadge";
import { POSITIONS, forceTextClass } from "@/lib/constants";
import type { Player, Position } from "@/lib/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { sel: string; copa: string };
}

export default async function SquadPage({ params }: PageProps) {
  const sel = decodeURIComponent(params.sel).toUpperCase();
  const copa = Number(params.copa);
  if (!Number.isFinite(copa)) notFound();

  const sb = supabasePublic();
  const { data: squad, error: e1 } = await sb
    .from("squads")
    .select("id, sel, copa, created_at")
    .eq("sel", sel)
    .eq("copa", copa)
    .maybeSingle();
  if (e1) throw new Error(e1.message);
  if (!squad) notFound();

  const { data: rows, error: e2 } = await sb
    .from("players")
    .select("id, squad_id, player_id, name, positions, number, force, legend")
    .eq("squad_id", squad.id);
  if (e2) throw new Error(e2.message);

  const players = (rows as Player[]) ?? [];
  const sorted = [...players].sort((a, b) => {
    const af = a.force ?? -1;
    const bf = b.force ?? -1;
    if (bf !== af) return bf - af;
    return a.name.localeCompare(b.name);
  });

  const rated = players.filter((p) => p.force != null) as (Player & { force: number })[];
  const avgForce = rated.length
    ? rated.reduce((acc, p) => acc + p.force, 0) / rated.length
    : null;
  const max = rated.length ? Math.max(...rated.map((p) => p.force)) : null;
  const min = rated.length ? Math.min(...rated.map((p) => p.force)) : null;

  const posCounts: Record<Position, number> = Object.fromEntries(
    POSITIONS.map((p) => [p, 0]),
  ) as Record<Position, number>;
  for (const p of players) {
    for (const pos of p.positions) {
      if (pos in posCounts) posCounts[pos as Position] += 1;
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end gap-6 justify-between">
        <div className="flex items-center gap-4">
          <SelBadge sel={squad.sel} copa={squad.copa} />
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {squad.sel}{" "}
              <span className="text-ink-300 font-normal">· Copa {squad.copa}</span>
            </h1>
            <p className="text-ink-300 text-sm">
              {players.length} jogadores · {rated.length} com força cadastrada
            </p>
          </div>
        </div>
        <a
          href="/"
          className="text-sm text-ink-300 hover:text-pitch-300"
        >
          ← Voltar para elencos
        </a>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Força média" value={avgForce != null ? avgForce.toFixed(1) : "—"} force={avgForce != null ? Math.round(avgForce) : null} />
        <Stat label="Maior força" value={max ?? "—"} force={max} />
        <Stat label="Menor força" value={min ?? "—"} force={min} />
      </section>

      <section className="rounded-lg border border-ink-700 bg-ink-900">
        <header className="flex items-center justify-between px-4 py-2 border-b border-ink-700">
          <h2 className="font-semibold">Jogadores</h2>
          <span className="text-xs text-ink-400">ordenado por força ↓</span>
        </header>
        <div className="overflow-x-auto scrollbar-pitch">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-400 text-xs uppercase tracking-wider">
              <tr className="border-b border-ink-700">
                <th className="px-4 py-2 w-12">#</th>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Posições</th>
                <th className="px-4 py-2 w-56">Força</th>
                <th className="px-4 py-2">Lenda</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-ink-800 last:border-0 ${
                    p.legend ? "bg-pitch-900/30" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-mono text-ink-300 tabular-nums">
                    {p.number ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {p.name}
                    {p.legend && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-pitch-200">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-ink-300">
                    <div className="flex flex-wrap gap-1">
                      {p.positions.map((pos) => (
                        <span
                          key={pos}
                          className="px-1.5 py-0.5 rounded bg-ink-700 text-ink-100 text-[10px] font-mono"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <ForceBar force={p.force} />
                  </td>
                  <td className="px-4 py-2">
                    {p.legend ? (
                      <span className="px-2 py-0.5 rounded bg-pitch-700 text-pitch-100 text-xs font-semibold">
                        LENDA
                      </span>
                    ) : (
                      <span className="text-ink-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-ink-700 bg-ink-900 p-4">
        <h2 className="font-semibold mb-3">Distribuição por posição</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {POSITIONS.map((p) => (
            <div
              key={p}
              className="rounded border border-ink-700 bg-ink-950 p-2 text-center"
            >
              <div className="text-xs font-mono text-ink-400">{p}</div>
              <div className="text-lg font-bold tabular-nums">
                {posCounts[p]}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  force,
}: {
  label: string;
  value: React.ReactNode;
  force: number | null;
}) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
      <div className="text-xs text-ink-400 uppercase tracking-wider">{label}</div>
      <div className={`text-3xl font-bold tabular-nums ${forceTextClass(force)}`}>
        {value}
      </div>
    </div>
  );
}
