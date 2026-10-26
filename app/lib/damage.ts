// 데미지 계산 (순수 함수). 결과 표처럼 여러 번 계산할 때는 이 함수를, 컴포넌트 하나에서는 useDamageCalc 를 쓴다.

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

// 0 = 포켓몬 챔피언스
const gen = Generations.get(0);

// 챔피언스 모드에서는 evs 자리에 능력 포인트를 넣는다.
function toPokemon({ name, sp, ...options }: PokemonInput) {
  return new Pokemon(gen, name, { ...options, evs: sp });
}

function toPercent(damage: number, maxHP: number) {
  return Math.floor((damage / maxHP) * 1000) / 10;
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

export function calcDamage(input: DamageCalcInput): DamageCalcState {
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
        // 더블에서는 범위기 위력이 0.75배가 된다.
        gameType: field?.format === "Doubles" ? "Doubles" : "Singles",
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
        result: {
          range: [0, 0],
          percent: [0, 0],
          ko: { n: 0 },
          koChance: "",
          desc: "",
        },
        error: null,
      };
    }

    const maxHP = defenderPokemon.maxHP();
    const ko = result.kochance();

    return {
      result: {
        range: [min, max],
        percent: [toPercent(min, maxHP), toPercent(max, maxHP)],
        ko: { n: ko.n, chance: ko.chance },
        koChance: ko.text,
        desc: result.desc(),
      },
      error: null,
    };
  } catch {
    return { result: null, error: "데미지를 계산할 수 없습니다." };
  }
}
