import { forceBarClass, forceTextClass } from "@/lib/constants";

export function ForceBar({
  force,
  width = "w-32",
}: {
  force: number | null;
  width?: string;
}) {
  const pct = force == null ? 0 : Math.max(2, Math.min(100, force));
  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${width} h-2 rounded-full bg-ink-700 overflow-hidden`}>
        <div
          className={`absolute inset-y-0 left-0 ${forceBarClass(force)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-sm font-mono tabular-nums w-8 text-right ${forceTextClass(force)}`}
      >
        {force ?? "—"}
      </span>
    </div>
  );
}
