// 사용률 상위 포켓몬의 "가장 많이 쓰는 세팅"을 만든다 (서버 전용).
// 성격/능력 포인트/도구/특성은 각 항목 1위, 기술은 변화기를 뺀 상위 4개.

import { Generations, toID } from "@smogon/calc";

import {
  getBattle,
  getRanking,
  type RankingEntry,
} from "~/lib/champions.server";
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

// 능력 포인트도 기술마다 고른다. 그 기술의 공격 능력치에 포인트를 준 분배 중 통계 상위를 쓴다.
// (물리형/특수형 분배가 섞여 집계돼서, 1위만 쓰면 특수 기술에 A32 분배가 들어간다.)
function statPointsFor(move: string, spreads: BattleRow[]) {
  const physical = moveCategory(move) === "Physical";
  const spread =
    spreads.find((row) =>
      Number(physical ? row.attack_points : row.sp_atk_points),
    ) ?? spreads[0];
  return toStatPoints(spread);
}

// 폼의 공격/특공 중 높은 쪽 기술을 먼저 고른다.
// 통계는 메가와 원종을 합쳐 집계해서, 특수형인 메가한카리아스Z에 지진/역린이 섞이는 걸 막는다.
function pickMoves(name: string, moveRows: BattleRow[]) {
  const stats = gen.species.get(toID(name) as never)?.baseStats;
  const main = stats && stats.spa > stats.atk ? "Special" : "Physical";
  const attacks = moveRows.filter((row) => isAttackMove(row.name));
  return [
    ...attacks.filter((row) => moveCategory(row.name) === main),
    ...attacks.filter((row) => moveCategory(row.name) !== main),
  ].slice(0, MOVE_COUNT);
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

// item 을 주면 통계 1위 도구 대신 그 도구를 든다 (메가 폼을 직접 고른 경우).
async function buildOpponent(
  format: BattleFormat,
  entry: RankingEntry,
  forcedItem?: string,
): Promise<OpponentSet> {
  const { rows } = await getBattle(format, entry.showdownId);
  const top = (category: BattleRow["category"]) =>
    rows.find((row) => row.category === category && row.rank === 1);

  const species =
    gen.species.get(toID(entry.showdownId) as never)?.name ?? entry.name;
  const item = forcedItem ?? top("held_item")?.name;
  // 통계의 특성은 메가진화 전 특성이라 메가 폼이면 바뀐다.
  const { name, ability } = toMega(species, item, top("ability")?.name);

  const byRank = (category: BattleRow["category"]) =>
    rows
      .filter((row) => row.category === category)
      .sort((a, b) => a.rank - b.rank);
  const natures = byRank("stat_alignment");
  const spreads = byRank("stat_points");

  const moves = pickMoves(name, byRank("move")).map((row) => ({
    name: row.name,
    koName: toKoName("move", row.name),
    nature: natureFor(row.name, natures),
    sp: statPointsFor(row.name, spreads),
  }));

  return {
    position: entry.position,
    name,
    koName: toKoName("pokemon", name),
    sprite: entry.sprite,
    ability,
    item,
    sp: toStatPoints(spreads[0]),
    moves,
  };
}

export async function getOpponents(
  format: BattleFormat,
  limit: number,
): Promise<OpponentSet[]> {
  const ranking = (await getRanking(format)).slice(0, limit);
  return Promise.all(ranking.map((entry) => buildOpponent(format, entry)));
}

// 메가 폼 → 그 메가스톤 이름 ("Garchomp-Mega-Z" → "Garchompite Z")
function megaStoneOf(mega: string) {
  for (const item of gen.items) {
    if (Object.values(item.megaStone ?? {}).includes(mega as never)) {
      return item.name;
    }
  }
  return undefined;
}

// 포켓몬 하나의 통계 세팅. 통계에 없는 포켓몬이면 null.
// 메가 폼은 통계가 원종으로 집계되므로 원종 통계에 그 메가스톤을 들려서 만든다.
export async function getOpponent(
  format: BattleFormat,
  name: string,
): Promise<OpponentSet | null> {
  const ranking = await getRanking(format);
  const species = gen.species.get(toID(name) as never);
  const stone = species ? megaStoneOf(species.name) : undefined;
  const statsId = toID(stone && species?.baseSpecies ? species.baseSpecies : name);

  const entry = ranking.find((entry) => entry.showdownId === statsId);
  if (!entry) return null;
  return buildOpponent(format, entry, stone);
}
