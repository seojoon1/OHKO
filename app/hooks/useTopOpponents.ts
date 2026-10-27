import { useEffect, useState } from "react";

import type { BattleFormat } from "~/types/champions";
import type { OpponentSet } from "~/types/opponent";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; opponents: OpponentSet[] };

// 상위 20위 세팅을 탭을 열 때(enabled) 불러온다. 형식별로 한 번만 불러와 둔다.
export function useTopOpponents(format: BattleFormat, enabled: boolean) {
  const [states, setStates] = useState<Partial<Record<BattleFormat, State>>>(
    {},
  );
  const state = states[format];

  useEffect(() => {
    if (!enabled || (state && state.status !== "error")) return;

    let cancelled = false;
    setStates((prev) => ({ ...prev, [format]: { status: "loading" } }));
    fetch(`/api/opponents?format=${format}`)
      .then(async (res) => {
        const body = await res.json();
        const next: State = res.ok
          ? { status: "done", opponents: body }
          : { status: "error", message: body.error };
        if (!cancelled) setStates((prev) => ({ ...prev, [format]: next }));
      })
      .catch(() => {
        if (!cancelled) {
          setStates((prev) => ({
            ...prev,
            [format]: { status: "error", message: "불러오지 못했습니다." },
          }));
        }
      });
    return () => {
      cancelled = true;
    };
    // state 는 결과를 쌓는 곳이라 의존성에서 뺀다 (넣으면 불러올 때마다 다시 돈다).
  }, [format, enabled]);

  return state;
}
