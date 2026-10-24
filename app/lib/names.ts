// 영문(Showdown 표기) → 한글 이름 변환.
// data/*.json 은 scripts/fetch-names.mjs 가 만든다 (런타임에 PokéAPI 호출 없음).

import { toID } from "@smogon/calc";

import abilities from "../../data/abilities.json";
import items from "../../data/items.json";
import moves from "../../data/moves.json";
import natures from "../../data/natures.json";
import pokemon from "../../data/pokemon.json";

const NAMES: Record<string, Record<string, string>> = {
  pokemon,
  move: moves,
  item: items,
  ability: abilities,
  nature: natures,
};

export type NameKind = "pokemon" | "move" | "item" | "ability" | "nature";

// 한글 이름이 없으면 영문 이름을 그대로 돌려준다.
export function toKoName(kind: NameKind, name: string): string {
  return NAMES[kind][toID(name)] ?? name;
}
