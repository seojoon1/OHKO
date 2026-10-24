import { PokemonPicker } from "~/components/PokemonPicker";
import type { useSampleOpponents } from "~/hooks/useSampleOpponents";
import { toKoName } from "~/lib/names";

interface Props {
  sample: ReturnType<typeof useSampleOpponents>;
}

// 자동 샘플 상대 목록: 검색해서 추가하면 통계 1위 세팅으로 계산된다.
export function SampleOpponents({ sample }: Props) {
  return (
    <div className="space-y-2">
      <PokemonPicker
        onSelect={sample.add}
        placeholder="상대 포켓몬 추가 (통계 1위 세팅으로 계산)"
      />
      {sample.names.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-sm">
          {sample.names.map((name) => {
            const entry = sample.entryOf(name);
            return (
              <li
                key={name}
                className="flex items-center gap-1 rounded border border-gray-300 px-2 py-0.5 dark:border-gray-700"
              >
                <span>{toKoName("pokemon", name)}</span>
                {entry?.status === "loading" && (
                  <span className="text-gray-500">불러오는 중</span>
                )}
                {entry?.status === "error" && (
                  <span className="text-red-600">{entry.message}</span>
                )}
                <button
                  type="button"
                  onClick={() => sample.remove(name)}
                  aria-label={`${toKoName("pokemon", name)} 빼기`}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
