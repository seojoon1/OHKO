import type { StatsTable } from "@smogon/calc";

import type { BattleFormat } from "~/types/champions";

export type Weather = "Sand" | "Sun" | "Rain" | "Snow";

export type Terrain = "Electric" | "Grassy" | "Psychic" | "Misty";

export interface PokemonInput {
  name: string;
  nature?: string;
  ability?: string;
  item?: string;
  /** 능력 포인트 */
  sp?: Partial<StatsTable>;
  /** 남은 HP (1~100%). 없으면 100% */
  hpPercent?: number;
  /** 기술 4칸 (빈 칸은 undefined). 계산에는 쓰지 않고 어떤 기술로 계산할지 고르는 데 쓴다. */
  moves?: (string | undefined)[];
  boosts?: Partial<StatsTable>;
}

export interface MoveInput {
  name: string;
  isCrit?: boolean;
}

export interface FieldInput {
  /** 기본 싱글. 더블이면 범위기 위력이 0.75배 */
  format?: BattleFormat;
  weather?: Weather;
  terrain?: Terrain;
  isReflect?: boolean;
  isLightScreen?: boolean;
}

export interface DamageCalcInput {
  attacker: PokemonInput;
  defender: PokemonInput;
  move: MoveInput;
  field?: FieldInput;
}

export interface DamageCalcResult {
  range: [number, number];
  percent: [number, number];
  /** 확정/난수 n타. chance 는 n타로 쓰러뜨릴 확률(0~1), 확정이면 1. 데미지 0이면 n = 0 */
  ko: { n: number; chance?: number };
  koChance: string;
  desc: string;
}

export type DamageCalcState =
  | { result: DamageCalcResult; error: null }
  | { result: null; error: string };
