// 내구 지수 = HP 실수치 × 방어(특방) 실수치.
// 챔피언스에는 돌격조끼/진화의휘석이 없어 도구 보정은 하지 않는다.

import { Generations, Pokemon } from "@smogon/calc";

import { toMega } from "~/lib/mega";
import type { PokemonInput } from "~/types/damage";

const gen = Generations.get(0);

export function calcBulk(input: PokemonInput) {
  // 메가스톤을 들면 메가 폼 능력치로 계산한다.
  const { name } = toMega(input.name, input.item, input.ability);
  try {
    const { stats } = new Pokemon(gen, name, {
      nature: input.nature,
      evs: input.sp,
    });
    return {
      hp: stats.hp,
      def: stats.def,
      spd: stats.spd,
      physical: stats.hp * stats.def,
      special: stats.hp * stats.spd,
    };
  } catch {
    return null;
  }
}
