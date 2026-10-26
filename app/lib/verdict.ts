// 데미지 판정 (결과 표, 1대1 공용)
import type { Weather } from "~/types/damage";

// 나오자마자 날씨를 바꾸는 특성
export const WEATHER_BY_ABILITY: Record<string, Weather> = {
  Drought: "Sun",
  Drizzle: "Rain",
  "Sand Stream": "Sand",
  "Snow Warning": "Snow",
};

/** ohko: 확정 1타, roll: 난수 1타, survive: 2타 이상, immune: 데미지 없음 */
export type Verdict = "survive" | "roll" | "ohko" | "immune";

export const VERDICT_STYLE: Record<Verdict, string> = {
  survive: "text-green-600",
  roll: "text-orange-600",
  ohko: "text-red-600",
  immune: "text-gray-400",
};

// 확정/난수 n타 → 판정과 문구 ("확정 2타", "난수 1타 (31%)", "5타 이상", "무효")
export function judge(n: number, chance: number | undefined, maxDamage: number) {
  if (maxDamage === 0) return { verdict: "immune" as Verdict, hits: "무효" };
  // kochance 는 5타 이상이면 n = 0 을 준다.
  if (n === 0) return { verdict: "survive" as Verdict, hits: "5타 이상" };
  const kind = chance === undefined || chance >= 1 ? "확정" : "난수";
  const percent = (chance ?? 0) * 100;
  // 아주 낮은 확률이 "0%"로 반올림되지 않게 한다.
  const chanceLabel = percent < 1 ? "1% 미만" : `${Math.round(percent)}%`;
  const hits = `${kind} ${n}타${kind === "난수" ? ` (${chanceLabel})` : ""}`;
  const verdict: Verdict =
    n >= 2 ? "survive" : kind === "확정" ? "ohko" : "roll";
  return { verdict, hits };
}
