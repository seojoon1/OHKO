// 사용률 상위 포켓몬의 "가장 많이 쓰는 세팅"을 만든다 (서버 전용).
// 성격/능력 포인트/도구/특성은 각 항목 1위, 기술은 변화기를 뺀 상위 4개.

import { Generations, toID } from "@smogon/calc";

import { getBattle, getRanking } from "~/lib/champions.server";
import { toMega } from "~/lib/mega";
import { toKoName } from "~/lib/names";
import type { BattleFormat, BattleRow } from "~/types/champions";
import type { OpponentSet } from "~/types/opponent";

const gen = Generations.get(0);

const MOVE_COUNT = 4;

function moveCategory(name: string) {
  return gen.moves.get(toID(name) as never)?.category;
}

function isAttackMove(name: string) {
  const category = moveCategory(name);
  return category === "Physical" || category === "Special";
}

// 성격은 기술마다 고른다. 통계 순위대로 보되, 그 기술의 공격 능력치를 깎는 성격은 건너뛴다.
// (성격과 능력 포인트가 따로 집계돼서 1위끼리 묶으면 "겁쟁이 + 지진" 같은 조합이 나온다.)
function natureFor(move: string, natures: BattleRow[]) {
  const lowered = moveCategory(move) === "Physical" ? "Attack" : "Sp. Atk";
  return (
    natures.find((row) => row.stat_down !== lowered)?.name ?? natures[0]?.name
  );
}

function toStatPoints(row?: BattleRow) {
  if (!row) return {};
  return {
    hp: Number(row.hp_points) || 0,
    atk: Number(row.attack_points) || 0,
    def: Number(row.defense_points) || 0,
    spa: Number(row.sp_atk_points) || 0,
    spd: Number(row.sp_def_points) || 0,
    spe: Number(row.speed_points) || 0,
  };
}

export async function getOpponents(
  format: BattleFormat,
  limit: number,
): Promise<OpponentSet[]> {
  const ranking = (await getRanking(format)).slice(0, limit);

  return Promise.all(
    ranking.map(async (entry) => {
      const { rows } = await getBattle(format, entry.showdownId);
      const top = (category: BattleRow["category"]) =>
        rows.find((row) => row.category === category && row.rank === 1);

      const species =
        gen.species.get(toID(entry.showdownId) as never)?.name ?? entry.name;
      const item = top("held_item")?.name;
      // 통계의 특성은 메가진화 전 특성이라 메가 폼이면 바뀐다.
      const { name, ability } = toMega(species, item, top("ability")?.name);

      const byRank = (category: BattleRow["category"]) =>
        rows
          .filter((row) => row.category === category)
          .sort((a, b) => a.rank - b.rank);
      const natures = byRank("stat_alignment");

      const moves = byRank("move")
        .filter((row) => isAttackMove(row.name))
        .slice(0, MOVE_COUNT)
        .map((row) => ({
          name: row.name,
          koName: toKoName("move", row.name),
          nature: natureFor(row.name, natures),
        }));

      return {
        position: entry.position,
        name,
        koName: toKoName("pokemon", name),
        sprite: entry.sprite,
        ability,
        item,
        sp: toStatPoints(top("stat_points")),
        moves,
      };
    }),
  );
}
