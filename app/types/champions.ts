// championsbattledata.com API 응답 타입 (화면에서 쓰는 필드만)

export type BattleFormat = "Singles" | "Doubles";

export type BattleCategory =
  | "move"
  | "held_item"
  | "ability"
  | "stat_alignment"
  | "stat_points"
  | "teammate";

/** 통계 한 줄 (예: 기술 1위 지진 65.4%) */
export interface BattleRow {
  pokemon: string;
  category: BattleCategory;
  rank: number;
  /** 기술/도구/특성/성격/동료 이름. stat_points 는 "" */
  name: string;
  /** "65.4%". teammate 는 "" */
  percentage: string;
  percentage_value: number | null;
  /** stat_alignment: 올라가는/내려가는 능력치 ("Attack", "Sp. Atk") */
  stat_up: string;
  stat_down: string;
  /** stat_points 에서만 숫자, 나머지는 "" */
  hp_points: number | "";
  attack_points: number | "";
  defense_points: number | "";
  sp_atk_points: number | "";
  sp_def_points: number | "";
  speed_points: number | "";
}

/** /api/index 의 포맷별 요약 */
export interface FormatSummary {
  /** 사용률 순위 */
  position: number;
  /** 항목별 1위 */
  top: Partial<Record<BattleCategory, BattleRow>>;
}

export interface IndexPokemon {
  name: string;
  showdownId: string;
  showdownName: string;
  summary: {
    /** "pokemon_champions_assets/pokemon/Garchomp.png" (사이트 기준 상대 경로) */
    sprite: string;
    types: string[];
    battleSummary?: {
      Current?: Partial<Record<BattleFormat, FormatSummary>>;
    };
  };
}

/** GET /api/index */
export interface IndexResponse {
  generatedAt: string;
  pokemon: IndexPokemon[];
}

/** GET /api/battle/{format}/{showdownId} */
export interface BattleResponse {
  pokemon: string;
  showdownId: string;
  format: BattleFormat;
  season: string;
  rows: BattleRow[];
}
