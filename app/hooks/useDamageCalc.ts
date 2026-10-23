import { useMemo } from "react";
import {
  calculate,
  Field,
  Generations,
  Move,
  Pokemon,
  Side,
} from "@smogon/calc";

import type {
  DamageCalcInput,
  DamageCalcResult,
  PokemonInput,
} from "~/types/damage";

const gen = Generations.get(9);

function toPokemon({ name, ...options }: PokemonInput) {
  return new Pokemon(gen, name, options);
}

function toPercent(damage: number, maxHP: number) {
  return Math.round((damage / maxHP) * 1000) / 10;
}

export function useDamageCalc(input: DamageCalcInput): DamageCalcResult {
  return useMemo(() => {
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
    const maxHP = defenderPokemon.maxHP();

    return {
      range: [min, max],
      percent: [toPercent(min, maxHP), toPercent(max, maxHP)],
      koChance: result.kochance().text,
      desc: result.desc(),
    };
  }, [input]);
}
