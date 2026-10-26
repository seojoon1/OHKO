import type { StatID } from "@smogon/calc";

import type { PokemonInput } from "~/types/damage";

type BoostStat = Exclude<StatID, "hp">;

const STATS: { id: BoostStat; label: string }[] = [
  { id: "atk", label: "A" },
  { id: "def", label: "B" },
  { id: "spa", label: "C" },
  { id: "spd", label: "D" },
  { id: "spe", label: "S" },
];

const MIN = -6;
const MAX = 6;

interface Props {
  boosts: PokemonInput["boosts"];
  onChange: (boosts: NonNullable<PokemonInput["boosts"]>) => void;
}

// 랭크 업/다운 (-6 ~ +6). 오르면 빨강, 내려가면 파랑.
export function RankControl({ boosts = {}, onChange }: Props) {
  const set = (stat: BoostStat, value: number) =>
    onChange({ ...boosts, [stat]: Math.max(MIN, Math.min(MAX, value)) });

  const changed = STATS.some((stat) => boosts[stat.id]);

  return (
    <div className="text-sm">
      <div className="mb-1 flex justify-between">
        <span>랭크</span>
        {changed && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-gray-500 hover:text-ink"
          >
            초기화
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {STATS.map((stat) => {
          const value = boosts[stat.id] ?? 0;
          const color =
            value > 0 ? "text-red-600" : value < 0 ? "text-blue-600" : "";
          return (
            <div key={stat.id} className="flex flex-col items-center gap-1">
              {stat.label}
              <div className="flex w-full items-center justify-between rounded border border-gray-300">
                <button
                  type="button"
                  onClick={() => set(stat.id, value - 1)}
                  disabled={value <= MIN}
                  aria-label={`${stat.label} 랭크 내리기`}
                  className="px-2 py-1 hover:bg-accent-soft disabled:opacity-30"
                >
                  −
                </button>
                <span className={`font-semibold tabular-nums ${color}`}>
                  {value > 0 ? `+${value}` : value}
                </span>
                <button
                  type="button"
                  onClick={() => set(stat.id, value + 1)}
                  disabled={value >= MAX}
                  aria-label={`${stat.label} 랭크 올리기`}
                  className="px-2 py-1 hover:bg-accent-soft disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
