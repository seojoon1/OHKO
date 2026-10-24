// 사용률 상위 포켓몬의 "가장 많이 쓰는 세팅"을 만든다 (서버 전용).
// 성격/능력 포인트/도구/특성은 각 항목 1위, 기술은 변화기를 뺀 상위 4개.

import { Generations, toID } from "@smogon/calc";

import { getBattle, getRanking } from "~/lib/champions.server";
import { toKoName } from "~/lib/names";
import type { BattleFormat, BattleRow } from "~/types/champions";
import type { OpponentSet } from "~/types/opponent";

const gen = Generations.get(0);

const MOVE_COUNT = 4;

function isAttackMove(name: string) {
  const category = gen.moves.get(toID(name) as never)?.category;
  return category === "Physical" || category === "Special";
}

// 1위 도구가 메가스톤이면 메가 폼 이름을 돌려준다 (Garchomp + Garchompite Z → Garchomp-Mega-Z)
function megaForm(species: string, item?: string) {
  if (!item) return undefined;
  return gen.items.get(toID(item) as never)?.megaStone?.[species as never];
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
      const mega = megaForm(species, item);
      const name = mega ?? species;
      // 통계의 특성은 메가진화 전 특성이다. 메가 폼은 특성이 하나로 정해져 있다.
      const ability = mega
        ? gen.species.get(toID(mega) as never)?.abilities?.[0]
        : top("ability")?.name;

      const moves = rows
        .filter((row) => row.category === "move" && isAttackMove(row.name))
        .sort((a, b) => a.rank - b.rank)
        .slice(0, MOVE_COUNT)
        .map((row) => ({ name: row.name, koName: toKoName("move", row.name) }));

      return {
        position: entry.position,
        name,
        koName: toKoName("pokemon", name),
        sprite: entry.sprite,
        nature: top("stat_alignment")?.name,
        ability,
        item,
        sp: toStatPoints(top("stat_points")),
        moves,
      };
    }),
  );
}
