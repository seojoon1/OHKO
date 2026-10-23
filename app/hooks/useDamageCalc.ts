import { useMemo } from "react";
import {
  calculate,
  Field,
  Generations,
  Move,
  Pokemon,
  Side,
  toID,
} from "@smogon/calc";

import type {
  DamageCalcInput,
  DamageCalcState,
  PokemonInput,
} from "~/types/damage";

const gen = Generations.get(9);

function toPokemon({ name, ...options }: PokemonInput) {
  return new Pokemon(gen, name, options);
}

function toPercent(damage: number, maxHP: number) {
  return Math.round((damage / maxHP) * 1000) / 10;
}

function validatePokemon(input: PokemonInput, label: string) {
  if (!gen.species.get(toID(input.name))) {
    return `${label} 포켓몬 "${input.name}"을(를) 찾을 수 없습니다.`;
  }
  if (input.nature && !gen.natures.get(toID(input.nature))) {
    return `${label} 성격 "${input.nature}"을(를) 찾을 수 없습니다.`;
  }
  if (input.ability && !gen.abilities.get(toID(input.ability))) {
    return `${label} 특성 "${input.ability}"을(를) 찾을 수 없습니다.`;
  }
  if (input.item && !gen.items.get(toID(input.item))) {
    return `${label} 도구 "${input.item}"을(를) 찾을 수 없습니다.`;
  }
  return null;
}

function validate({ attacker, defender, move }: DamageCalcInput) {
  return (
    validatePokemon(attacker, "공격자") ??
    validatePokemon(defender, "방어자") ??
    (gen.moves.get(toID(move.name))
      ? null
      : `기술 "${move.name}"을(를) 찾을 수 없습니다.`)
  );
}

export function useDamageCalc(input: DamageCalcInput): DamageCalcState {
  return useMemo(() => {
    const error = validate(input);
    if (error) return { result: null, error };

    try {
      const { attacker, defender, move, field } = input;
      const defenderPokemon = toPokemon(defender);

      const result = calculate(
        gen,
        toPokemon(attacker),
        defenderPokemon,
        new Move(gen, move.name, { isCrit: move.isCrit }),
        new Field({
          weather: field?.weather,
          terrain: field?.terrain,
          defenderSide: new Side({
            isReflect: field?.isReflect,
            isLightScreen: field?.isLightScreen,
          }),
        }),
      );

      const [min, max] = result.range();

      // 타입 무효, 변화기 등 데미지가 0이면 kochance()와 desc()가 예외를 던진다.
      if (max === 0) {
        return {
          result: { range: [0, 0], percent: [0, 0], koChance: "", desc: "" },
          error: null,
        };
      }

      const maxHP = defenderPokemon.maxHP();

      return {
        result: {
          range: [min, max],
          percent: [toPercent(min, maxHP), toPercent(max, maxHP)],
          koChance: result.kochance().text,
          desc: result.desc(),
        },
        error: null,
      };
    } catch {
      return { result: null, error: "데미지를 계산할 수 없습니다." };
    }
  }, [input]);
}
