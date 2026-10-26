import { useEffect, useState } from "react";

// @smogon/calc 는 모든 세대 데이터를 담고 있어 크다(약 500KB).
// 첫 화면에 넣지 않고 화면이 뜬 뒤 따로 불러온다.
export interface Calculator {
  calcDamage: (typeof import("~/lib/damage"))["calcDamage"];
  calcBulk: (typeof import("~/lib/bulk"))["calcBulk"];
}

let loaded: Calculator | null = null;
let loading: Promise<Calculator> | undefined;

export function loadCalculator() {
  loading ??= Promise.all([import("~/lib/damage"), import("~/lib/bulk")]).then(
    ([damage, bulk]) => {
      loaded = { calcDamage: damage.calcDamage, calcBulk: bulk.calcBulk };
      return loaded;
    },
  );
  return loading;
}

// 계산기가 준비되면 돌려준다. 준비 전(서버 렌더링 포함)에는 null.
export function useCalculator() {
  const [calculator, setCalculator] = useState<Calculator | null>(loaded);

  useEffect(() => {
    if (calculator) return;
    let cancelled = false;
    loadCalculator().then((value) => {
      if (!cancelled) setCalculator(value);
    });
    return () => {
      cancelled = true;
    };
  }, [calculator]);

  return calculator;
}
