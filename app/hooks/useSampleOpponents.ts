import { useEffect, useState } from "react";

import type { BattleFormat } from "~/types/champions";
import type { OpponentSet } from "~/types/opponent";

type Entry =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; set: OpponentSet };

// 자동 샘플: 고른 포켓몬마다 /api/opponent 로 통계 1위 세팅을 받아온다.
// 형식(싱글/더블)이 바뀌면 그 형식의 통계로 다시 받는다.
export function useSampleOpponents(format: BattleFormat) {
  const [names, setNames] = useState<string[]>([]);
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  const keyOf = (name: string) => `${format}:${name}`;

  useEffect(() => {
    for (const name of names) {
      const key = keyOf(name);
      if (entries[key]) continue;

      setEntries((prev) => ({ ...prev, [key]: { status: "loading" } }));
      fetch(`/api/opponent/${encodeURIComponent(name)}?format=${format}`)
        .then(async (res) => {
          const body = await res.json();
          const entry: Entry = res.ok
            ? { status: "done", set: body }
            : { status: "error", message: body.error };
          setEntries((prev) => ({ ...prev, [key]: entry }));
        })
        .catch(() =>
          setEntries((prev) => ({
            ...prev,
            [key]: { status: "error", message: "불러오지 못했습니다." },
          })),
        );
    }
    // entries 는 받아온 결과를 쌓는 곳이라 의존성에서 뺀다 (넣으면 받을 때마다 다시 돈다).
  }, [names, format]);

  return {
    names,
    add: (name: string) =>
      setNames((prev) => (prev.includes(name) ? prev : [...prev, name])),
    remove: (name: string) =>
      setNames((prev) => prev.filter((item) => item !== name)),
    entryOf: (name: string): Entry | undefined => entries[keyOf(name)],
    opponents: names.flatMap((name) => {
      const entry = entries[keyOf(name)];
      return entry?.status === "done" ? [entry.set] : [];
    }),
  };
}
