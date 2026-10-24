import type { StatsTable } from "@smogon/calc";

export type Weather = "Sand" | "Sun" | "Rain" | "Snow";

export type Terrain = "Electric" | "Grassy" | "Psychic" | "Misty";

export interface PokemonInput {
  name: string;
  nature?: string;
  ability?: string;
  item?: string;
  /** 능력 포인트 */
  sp?: Partial<StatsTable>;
  boosts?: Partial<StatsTable>;
}

export interface MoveInput {
  name: string;
  isCrit?: boolean;
}

export interface FieldInput {
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
  koChance: string;
  desc: string;
}

export type DamageCalcState =
  | { result: DamageCalcResult; error: null }
  | { result: null; error: string };
