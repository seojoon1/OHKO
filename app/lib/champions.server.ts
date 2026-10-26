// championsbattledata.com API 클라이언트 (서버 전용).
// 데이터가 하루 단위로 갱신되므로 응답을 메모리에 1시간 캐시한다.
// /api/index 는 6MB 라 브라우저로 그대로 보내지 않고, loader 에서 필요한 필드만 추린다.

import type {
  BattleFormat,
  BattleResponse,
  IndexResponse,
} from "~/types/champions";

export const API_BASE = "https://championsbattledata.com";

const CACHE_TTL = 60 * 60 * 1000; // 1시간

const cache = new Map<string, { expires: number; data: Promise<unknown> }>();

// 같은 경로를 동시에 요청하면 요청 하나를 공유한다. 실패한 요청은 캐시하지 않는다.
function fetchCached<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && hit.expires > Date.now()) return hit.data as Promise<T>;

  const data = fetch(`${API_BASE}${path}`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json() as Promise<T>;
  });
  data.catch(() => cache.delete(path));
  cache.set(path, { expires: Date.now() + CACHE_TTL, data });
  return data;
}

export function getIndex() {
  return fetchCached<IndexResponse>("/api/index");
}

// ?format= 값 → BattleFormat (기본 싱글)
export function toFormat(value: string | null): BattleFormat {
  return value === "Doubles" ? "Doubles" : "Singles";
}

export interface RankingEntry {
  position: number;
  showdownId: string;
  name: string;
  sprite: string;
  move?: string;
  item?: string;
  ability?: string;
  nature?: string;
}

// 인덱스에서 사용률 순위와 항목별 1위만 추린다.
export async function getRanking(format: BattleFormat) {
  const index = await getIndex();
  return index.pokemon
    .flatMap((pokemon): RankingEntry[] => {
      const summary = pokemon.summary.battleSummary?.Current?.[format];
      if (!summary) return [];
      const { top } = summary;
      return [
        {
          position: summary.position,
          showdownId: pokemon.showdownId,
          name: pokemon.name,
          sprite: `${API_BASE}/${pokemon.summary.sprite}`,
          move: top.move?.name,
          item: top.held_item?.name,
          ability: top.ability?.name,
          nature: top.stat_alignment?.name,
        },
      ];
    })
    .sort((a, b) => a.position - b.position);
}

export class PokemonNotFoundError extends Error {}

// 인덱스(캐시됨)에 없는 ID는 외부 API를 부르지 않고 바로 실패한다.
// 아무 ID로나 요청해 우리 서버가 외부 API에 요청을 쏟아내지 않게 하기 위해서다.
export async function getBattle(format: BattleFormat, showdownId: string) {
  const id = showdownId.toLowerCase();
  const index = await getIndex();
  if (!index.pokemon.some((pokemon) => pokemon.showdownId === id)) {
    throw new PokemonNotFoundError(showdownId);
  }
  return fetchCached<BattleResponse>(
    `/api/battle/${format}/${encodeURIComponent(id)}`,
  );
}
