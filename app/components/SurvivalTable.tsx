import { calcDamage } from "~/lib/damage";
import { toMega } from "~/lib/mega";
import type { BattleFormat } from "~/types/champions";
import type { PokemonInput, Weather } from "~/types/damage";
import type { OpponentSet } from "~/types/opponent";

// 나오자마자 날씨를 바꾸는 특성
const WEATHER_BY_ABILITY: Record<string, Weather> = {
  Drought: "Sun",
  Drizzle: "Rain",
  "Sand Stream": "Sand",
  "Snow Warning": "Snow",
};

type Verdict = "survive" | "roll" | "ohko" | "immune";

const VERDICT_STYLE: Record<Verdict, string> = {
  survive: "text-green-600 dark:text-green-400",
  roll: "text-orange-600 dark:text-orange-400",
  ohko: "text-red-600 dark:text-red-400",
  immune: "text-gray-400",
};

function judge(n: number, chance: number | undefined, maxDamage: number) {
  if (maxDamage === 0) return { verdict: "immune" as const, label: "무효" };
  // kochance 는 5타 이상이면 n = 0 을 준다.
  if (n === 0) return { verdict: "survive" as const, label: "버팀 (5타 이상)" };
  const kind = chance === undefined || chance >= 1 ? "확정" : "난수";
  const percent = (chance ?? 0) * 100;
  // 아주 낮은 확률이 "0%"로 반올림되지 않게 한다.
  const chanceLabel = percent < 1 ? "1% 미만" : `${Math.round(percent)}%`;
  const hits = `${kind} ${n}타${kind === "난수" ? ` (${chanceLabel})` : ""}`;
  if (n >= 2) return { verdict: "survive" as const, label: `버팀 · ${hits}` };
  return { verdict: kind === "확정" ? ("ohko" as const) : ("roll" as const), label: hits };
}

interface Props {
  myPokemon: PokemonInput;
  opponents: OpponentSet[];
  format: BattleFormat;
  /** 모든 상대에게 적용할 날씨. 없으면 상대의 날씨 특성을 따른다. */
  weather?: Weather;
}

export function SurvivalTable({
  myPokemon,
  opponents,
  format,
  weather,
}: Props) {
  const defender = {
    ...myPokemon,
    ...toMega(myPokemon.name, myPokemon.item, myPokemon.ability),
  };

  const rows = opponents.flatMap((opponent, opponentIndex) =>
    opponent.moves.map((move, index) => {
      const { result, error } = calcDamage({
        attacker: {
          name: opponent.name,
          nature: move.nature,
          ability: opponent.ability,
          item: opponent.item,
          sp: move.sp ?? opponent.sp,
        },
        defender,
        move: { name: move.name },
        field: {
          format,
          // 고른 날씨가 없으면 상대의 날씨 특성을 따른다.
          weather:
            weather ??
            (opponent.ability
              ? WEATHER_BY_ABILITY[opponent.ability]
              : undefined),
        },
      });
      const judgement = result
        ? judge(result.ko.n, result.ko.chance, result.range[1])
        : null;
      const key = `${opponentIndex}-${index}`;
      return { key, opponent, move, index, result, error, judgement };
    }),
  );

  const count = (verdict: Verdict) =>
    rows.filter((row) => row.judgement?.verdict === verdict).length;

  return (
    <section>
      <p className="mb-2 text-sm">
        <span className={VERDICT_STYLE.survive}>버팀 {count("survive")}</span>
        {" · "}
        <span className={VERDICT_STYLE.roll}>난수 1타 {count("roll")}</span>
        {" · "}
        <span className={VERDICT_STYLE.ohko}>확정 1타 {count("ohko")}</span>
        {" · "}
        <span className={VERDICT_STYLE.immune}>무효 {count("immune")}</span>
      </p>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th className="py-2 pr-2">상대</th>
            <th className="py-2 pr-2">기술</th>
            <th className="py-2 pr-2">데미지</th>
            <th className="py-2">판정</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, opponent, move, index, result, error, judgement }) => (
            <tr
              key={key}
              className={
                index === opponent.moves.length - 1
                  ? "border-b border-gray-200 dark:border-gray-800"
                  : ""
              }
            >
              {index === 0 && (
                <td rowSpan={opponent.moves.length} className="py-1 pr-2 align-top">
                  <span className="flex items-center gap-2">
                    {opponent.sprite && (
                      <img
                        src={opponent.sprite}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                      />
                    )}
                    <span>
                      {opponent.position && `${opponent.position}. `}
                      {opponent.koName}
                    </span>
                  </span>
                </td>
              )}
              <td className="py-1 pr-2">{move.koName}</td>
              <td className="py-1 pr-2">
                {result
                  ? `${result.percent[0]} – ${result.percent[1]}%`
                  : "-"}
              </td>
              <td
                className={`py-1 ${judgement ? VERDICT_STYLE[judgement.verdict] : ""}`}
              >
                {judgement?.label ?? error}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
