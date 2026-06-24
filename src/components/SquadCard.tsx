import Link from "next/link";
import { SelBadge } from "./SelBadge";
import { forceTextClass } from "@/lib/constants";

interface Props {
  sel: string;
  copa: number;
  avgForce: number | null;
  ratedCount: number;
  playerCount: number;
  strongest?: { name: string; force: number | null } | null;
  weakest?: { name: string; force: number | null } | null;
}

export function SquadCard({
  sel,
  copa,
  avgForce,
  ratedCount,
  playerCount,
  strongest,
  weakest,
}: Props) {
  return (
    <Link
      href={`/squad/${sel}/${copa}`}
      className="group block rounded-lg border border-ink-700 bg-ink-900 hover:border-pitch-500 hover:bg-ink-800 transition p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <SelBadge sel={sel} copa={copa} />
        <div className="text-right">
          <div className="text-xs text-ink-400 uppercase tracking-wider">Média</div>
          <div className={`text-2xl font-bold tabular-nums ${forceTextClass(avgForce ? Math.round(avgForce) : null)}`}>
            {avgForce != null ? avgForce.toFixed(1) : "—"}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded border border-ink-700 bg-ink-950 p-2">
          <div className="text-ink-400">Mais forte</div>
          <div className="font-medium text-pitch-300 truncate">
            {strongest?.name ?? "—"}{" "}
            <span className="text-ink-300 font-mono">
              {strongest?.force ?? ""}
            </span>
          </div>
        </div>
        <div className="rounded border border-ink-700 bg-ink-950 p-2">
          <div className="text-ink-400">Mais fraco</div>
          <div className="font-medium text-ink-200 truncate">
            {weakest?.name ?? "—"}{" "}
            <span className="text-ink-300 font-mono">
              {weakest?.force ?? ""}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
        <span>
          {ratedCount}/{playerCount} com força
        </span>
        <span className="text-pitch-400 opacity-0 group-hover:opacity-100 transition">
          ver elenco →
        </span>
      </div>
    </Link>
  );
}
