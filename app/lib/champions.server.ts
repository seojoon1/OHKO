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

export function getBattle(format: BattleFormat, showdownId: string) {
  return fetchCached<BattleResponse>(
    `/api/battle/${format}/${encodeURIComponent(showdownId)}`,
  );
}
