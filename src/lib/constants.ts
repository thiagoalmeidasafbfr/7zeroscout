import type { Position } from "./types";

export const POSITIONS: Position[] = [
  "GOL",
  "ZAG",
  "LD",
  "LE",
  "VOL",
  "MC",
  "MD",
  "ME",
  "MEI",
  "PD",
  "PE",
  "CA",
];

export const POSITION_LABELS: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LD: "Lateral Direito",
  LE: "Lateral Esquerdo",
  VOL: "Volante",
  MC: "Meio-campo Central",
  MD: "Meia Direita",
  ME: "Meia Esquerda",
  MEI: "Meia",
  PD: "Ponta Direita",
  PE: "Ponta Esquerda",
  CA: "Centroavante",
};

export function forceTier(force: number | null): "none" | "low" | "mid" | "high" {
  if (force == null) return "none";
  if (force <= 49) return "low";
  if (force <= 74) return "mid";
  return "high";
}

export function forceBarClass(force: number | null): string {
  switch (forceTier(force)) {
    case "low":
      return "bg-red-500";
    case "mid":
      return "bg-yellow-400";
    case "high":
      return "bg-pitch-400";
    default:
      return "bg-ink-600";
  }
}

export function forceTextClass(force: number | null): string {
  switch (forceTier(force)) {
    case "low":
      return "text-red-400";
    case "mid":
      return "text-yellow-300";
    case "high":
      return "text-pitch-300";
    default:
      return "text-ink-300";
  }
}
