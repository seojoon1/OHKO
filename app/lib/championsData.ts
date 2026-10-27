// 화면용 챔피언스 데이터 (목록·검색·메가 변환).
// 무거운 @smogon/calc 대신 scripts/build-calc-data.mjs 가 뽑아 둔 작은 JSON을 쓴다.
// 실제 데미지/능력치 계산만 @smogon/calc 를 쓴다 (lib/damage.ts, lib/bulk.ts).

import data from "../../data/champions.json";

export interface SpeciesData {
  name: string;
  /** 첫 특성 (smogon 데이터에는 포켓몬마다 하나만 있다) */
  ability: string | null;
}

export interface NatureData {
  name: string;
  plus: string | null;
  minus: string | null;
}

export interface ItemData {
  name: string;
  /** 메가스톤이면 { 원종: 메가 폼 } */
  megaStone?: Record<string, string>;
}

export const SPECIES: SpeciesData[] = data.species;
export const NATURES: NatureData[] = data.natures;
export const ITEMS: ItemData[] = data.items as ItemData[];
export const ABILITIES: string[] = data.abilities;
export const ATTACK_MOVES: string[] = data.attackMoves;

// @smogon/calc 의 toID 와 같은 규칙 ("Will-O-Wisp" → "willowisp")
export function toID(text: string) {
  const lower = text.toLowerCase();
  if (lower === "flabébé") return "flabebe";
  return lower.replace(/[^a-z0-9]+/g, "");
}

const speciesById = new Map(SPECIES.map((s) => [toID(s.name), s]));
const itemsById = new Map(ITEMS.map((i) => [toID(i.name), i]));

export function findSpecies(name: string) {
  return speciesById.get(toID(name));
}

export function findItem(name: string) {
  return itemsById.get(toID(name));
}
