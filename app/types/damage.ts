import type { StatsTable } from "@smogon/calc";

export type Weather =
  | "Sand"
  | "Sun"
  | "Rain"
  | "Snow"
  | "Harsh Sunshine"
  | "Heavy Rain"
  | "Strong Winds";

export type Terrain = "Electric" | "Grassy" | "Psychic" | "Misty";

export type TypeName =
  | "Normal"
  | "Fighting"
  | "Flying"
  | "Poison"
  | "Ground"
  | "Rock"
  | "Bug"
  | "Ghost"
  | "Steel"
  | "Fire"
  | "Water"
  | "Grass"
  | "Electric"
  | "Psychic"
  | "Ice"
  | "Dragon"
  | "Dark"
  | "Fairy"
  | "Stellar";

export interface PokemonInput {
  name: string;
  level?: number;
  nature?: string;
  ability?: string;
  item?: string;
  evs?: Partial<StatsTable>;
  ivs?: Partial<StatsTable>;
  boosts?: Partial<StatsTable>;
  teraType?: TypeName;
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
