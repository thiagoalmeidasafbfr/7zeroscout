export type Position =
  | "GOL"
  | "ZAG"
  | "LD"
  | "LE"
  | "VOL"
  | "MC"
  | "MD"
  | "ME"
  | "MEI"
  | "PD"
  | "PE"
  | "CA";

export interface Squad {
  id: number;
  sel: string;
  copa: number;
  created_at: string;
}

export interface Player {
  id: number;
  squad_id: number;
  player_id: string;
  name: string;
  positions: Position[];
  number: number | null;
  force: number | null;
  legend: boolean;
}

export interface SquadStats {
  id: number;
  sel: string;
  copa: number;
  created_at: string;
  player_count: number;
  rated_count: number;
  avg_force: number | null;
  max_force: number | null;
  min_force: number | null;
}

export interface ImportPayload {
  sel: string;
  copa: number;
  squad: Array<{
    playerId: string;
    name: string;
    positions: string[];
    number?: number | null;
    legend?: boolean;
    f?: unknown;
  }>;
}

export interface UpdateForcePayload {
  sel: string;
  copa: number;
  players: Array<{ playerId: string; force: number | null }>;
}
