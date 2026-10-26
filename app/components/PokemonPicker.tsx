import { usePokemonSearch } from "~/hooks/usePokemonSearch";

export const fieldClass =
  "rounded border border-gray-300 bg-transparent px-2 py-1";

interface Props {
  /** Showdown 이름 ("Garchomp") */
  onSelect: (name: string) => void;
  placeholder: string;
}

// 한글(초성 포함)로 포켓몬을 검색해 고르는 입력창. 고르면 입력이 비워진다.
export function PokemonPicker({ onSelect, placeholder }: Props) {
  const { query, setQuery, results } = usePokemonSearch();

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className={`${fieldClass} w-full`}
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded border border-gray-300 bg-white text-sm shadow">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSelect(result.name);
                }}
                className="w-full px-2 py-1 text-left hover:bg-accent-soft"
              >
                {result.koName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
