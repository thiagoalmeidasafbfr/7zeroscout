"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSquad } from "./page";
import { ForceBar } from "@/components/ForceBar";

export function AdminClient({ squads }: { squads: AdminSquad[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"import" | "force">("import");

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-ink-300 text-sm">
          Importação de elencos e atualização manual das forças (modo clássico).
        </p>
      </section>

      <nav className="flex gap-2 border-b border-ink-700">
        <TabBtn active={tab === "import"} onClick={() => setTab("import")}>
          Importar elenco
        </TabBtn>
        <TabBtn active={tab === "force"} onClick={() => setTab("force")}>
          Atualizar forças
        </TabBtn>
      </nav>

      {tab === "import" ? (
        <ImportForm onDone={() => router.refresh()} />
      ) : (
        <ForceForm squads={squads} onDone={() => router.refresh()} />
      )}

      <section className="rounded-lg border border-ink-700 bg-ink-900">
        <header className="flex items-center justify-between px-4 py-2 border-b border-ink-700">
          <h2 className="font-semibold">Elencos cadastrados</h2>
          <span className="text-xs text-ink-400">
            destaque amarelo = ainda há jogadores sem força
          </span>
        </header>
        <div className="overflow-x-auto scrollbar-pitch">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-400 text-xs uppercase tracking-wider">
              <tr className="border-b border-ink-700">
                <th className="px-4 py-2">Seleção</th>
                <th className="px-4 py-2">Copa</th>
                <th className="px-4 py-2">Jogadores</th>
                <th className="px-4 py-2">Sem força</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {squads.map((s) => {
                const pending = s.missing_force > 0;
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-ink-800 last:border-0 ${
                      pending ? "bg-yellow-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-mono">{s.sel}</td>
                    <td className="px-4 py-2 font-mono">{s.copa}</td>
                    <td className="px-4 py-2 tabular-nums">{s.player_count}</td>
                    <td className="px-4 py-2 tabular-nums">
                      <span className={pending ? "text-yellow-300" : "text-ink-400"}>
                        {s.missing_force}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {pending ? (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-200 text-xs font-semibold">
                          pendente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-pitch-700 text-pitch-100 text-xs font-semibold">
                          completo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {squads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-300">
                    Nenhum elenco cadastrado ainda.
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

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
        active
          ? "border-pitch-400 text-pitch-200"
          : "border-transparent text-ink-300 hover:text-ink-100"
      }`}
    >
      {children}
    </button>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const [json, setJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch (err) {
        throw new Error("JSON inválido: " + (err as Error).message);
      }
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
      setResult({
        ok: true,
        message: `OK — ${body.inserted_or_updated} jogador(es) inseridos/atualizados em ${body.sel}/${body.copa}.`,
      });
      onDone();
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink-700 bg-ink-900 p-4 space-y-3">
      <div>
        <h2 className="font-semibold">Importar elenco</h2>
        <p className="text-xs text-ink-400">
          Cole o JSON exato retornado pela API do 7a0. O campo <code>f</code> é ignorado.
        </p>
      </div>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
        rows={14}
        placeholder='{ "sel": "BRA", "copa": 2022, "squad": [ ... ] }'
        className="w-full font-mono text-xs bg-ink-950 border border-ink-700 rounded p-3 focus:outline-none focus:border-pitch-400"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={busy || json.trim() === ""}
          onClick={submit}
          className="px-4 py-2 rounded bg-pitch-500 hover:bg-pitch-400 disabled:opacity-40 text-ink-950 font-semibold text-sm"
        >
          {busy ? "Enviando..." : "Importar"}
        </button>
        {result && (
          <span
            className={`text-sm ${
              result.ok ? "text-pitch-300" : "text-red-400"
            }`}
          >
            {result.message}
          </span>
        )}
      </div>
    </section>
  );
}

function ForceForm({
  squads,
  onDone,
}: {
  squads: AdminSquad[];
  onDone: () => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    squads.find((s) => s.missing_force > 0)?.id ?? squads[0]?.id ?? null,
  );
  const selected = useMemo(
    () => squads.find((s) => s.id === selectedId) ?? null,
    [squads, selectedId],
  );
  const [forces, setForces] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  function getValue(playerId: string, current: number | null): string {
    if (forces[playerId] !== undefined) return forces[playerId];
    return current == null ? "" : String(current);
  }

  async function submit() {
    if (!selected) return;
    setBusy(true);
    setResult(null);
    try {
      const players = Object.entries(forces)
        .map(([playerId, v]) => {
          const n = v.trim() === "" ? null : Number(v);
          return { playerId, force: n };
        })
        .filter((p) => p.force === null || (Number.isInteger(p.force) && (p.force as number) >= 1 && (p.force as number) <= 99));

      if (players.length === 0) {
        throw new Error("Nada para atualizar.");
      }
      const res = await fetch("/api/update-force", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sel: selected.sel, copa: selected.copa, players }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
      setResult({
        ok: true,
        message: `OK — ${body.updated} jogador(es) atualizado(s).`,
      });
      setForces({});
      onDone();
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-ink-700 bg-ink-900 p-4 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">Atualizar forças</h2>
          <p className="text-xs text-ink-400">
            Valores de 1 a 99. Deixe em branco para manter como nulo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-400">Elenco</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => {
              setSelectedId(e.target.value ? Number(e.target.value) : null);
              setForces({});
              setResult(null);
            }}
            className="bg-ink-800 border border-ink-600 text-ink-100 rounded px-2 py-1 text-sm"
          >
            {squads.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sel} · {s.copa} {s.missing_force > 0 ? `(${s.missing_force} sem força)` : "✓"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected && selected.players.length > 0 ? (
        <div className="overflow-x-auto scrollbar-pitch">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-400 text-xs uppercase tracking-wider">
              <tr className="border-b border-ink-700">
                <th className="px-3 py-2 w-12">#</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Posições</th>
                <th className="px-3 py-2 w-44">Atual</th>
                <th className="px-3 py-2 w-24">Nova força</th>
              </tr>
            </thead>
            <tbody>
              {[...selected.players]
                .sort((a, b) => (a.name).localeCompare(b.name))
                .map((p) => (
                  <tr key={p.player_id} className="border-b border-ink-800 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-ink-300 tabular-nums">
                      {p.number ?? "—"}
                    </td>
                    <td className="px-3 py-1.5 font-medium">
                      {p.name}
                      {p.legend && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-pitch-200">
                          ★
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
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
                    <td className="px-3 py-1.5">
                      <ForceBar force={p.force} width="w-24" />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={getValue(p.player_id, p.force)}
                        onChange={(e) =>
                          setForces((prev) => ({
                            ...prev,
                            [p.player_id]: e.target.value,
                          }))
                        }
                        className="w-20 bg-ink-950 border border-ink-700 rounded px-2 py-1 text-sm font-mono text-ink-100 focus:outline-none focus:border-pitch-400"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-ink-300 text-sm">
          Selecione um elenco com jogadores cadastrados.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          disabled={busy || !selected || Object.keys(forces).length === 0}
          onClick={submit}
          className="px-4 py-2 rounded bg-pitch-500 hover:bg-pitch-400 disabled:opacity-40 text-ink-950 font-semibold text-sm"
        >
          {busy ? "Salvando..." : "Salvar forças"}
        </button>
        {result && (
          <span className={`text-sm ${result.ok ? "text-pitch-300" : "text-red-400"}`}>
            {result.message}
          </span>
        )}
      </div>
    </section>
  );
}
