"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { POSITIONS } from "@/lib/constants";
import type { Position } from "@/lib/types";
import { useCallback, useTransition } from "react";

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params?.toString() ?? "");
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      start(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  return { params, set, pending };
}

export function PositionFilter() {
  const { params, set } = useUrlState();
  const current = (params?.get("pos") ?? "") as Position | "";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        onClick={() => set("pos", null)}
        className={`px-2 py-1 rounded text-xs font-mono border ${
          current === ""
            ? "border-pitch-400 bg-pitch-700/40 text-pitch-100"
            : "border-ink-600 bg-ink-800 text-ink-300 hover:border-ink-500"
        }`}
      >
        ALL
      </button>
      {POSITIONS.map((p) => (
        <button
          key={p}
          onClick={() => set("pos", p)}
          className={`px-2 py-1 rounded text-xs font-mono border ${
            current === p
              ? "border-pitch-400 bg-pitch-700/40 text-pitch-100"
              : "border-ink-600 bg-ink-800 text-ink-300 hover:border-ink-500"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function CopaFilter({ copas }: { copas: number[] }) {
  const { params, set } = useUrlState();
  const current = params?.get("copa") ?? "";
  return (
    <select
      value={current}
      onChange={(e) => set("copa", e.target.value || null)}
      className="bg-ink-800 border border-ink-600 text-ink-100 rounded px-2 py-1 text-sm"
    >
      <option value="">Todas as copas</option>
      {copas.map((c) => (
        <option key={c} value={String(c)}>
          {c}
        </option>
      ))}
    </select>
  );
}

export function SearchBar({ placeholder }: { placeholder?: string }) {
  const { params, set } = useUrlState();
  const current = params?.get("q") ?? "";
  return (
    <input
      type="search"
      defaultValue={current}
      placeholder={placeholder ?? "Buscar..."}
      onChange={(e) => set("q", e.target.value || null)}
      className="bg-ink-800 border border-ink-600 text-ink-100 rounded px-3 py-1.5 text-sm w-full sm:w-72 placeholder:text-ink-400 focus:outline-none focus:border-pitch-400"
    />
  );
}
