import { useMemo, useState } from "react";
import { Generations } from "@smogon/calc";

import pokemonKo from "../../data/pokemon.json";
import { chosungIncludes } from "~/lib/hangul";

export interface PokemonSearchResult {
  /** Showdown ID ("garchompmegaz") */
  id: string;
  /** Showdown 이름 ("Garchomp-Mega-Z") – 계산기/통계 API 입력용 */
  name: string;
  /** 한글 이름 ("메가한카리아스Z") */
  koName: string;
}

const gen = Generations.get(0);

const ALL: PokemonSearchResult[] = Object.entries(
  pokemonKo as Record<string, string>,
).flatMap(([id, koName]) => {
  const species = gen.species.get(id as never);
  return species ? [{ id, name: species.name, koName }] : [];
});

function search(query: string) {
  const q = query.replace(/\s+/g, "");
  if (!q) return [];

  const isPrefix = (text: string) =>
    chosungIncludes(text.slice(0, q.length), q);

  return ALL.filter(({ koName }) => chosungIncludes(koName, q)).sort(
    (a, b) =>
      Number(isPrefix(b.koName)) - Number(isPrefix(a.koName)) ||
      a.koName.localeCompare(b.koName, "ko"),
  );
}

// 한글 이름(초성 포함)으로 포켓몬을 검색한다. 앞부분이 일치하는 결과가 먼저 온다.
export function usePokemonSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  return { query, setQuery, results };
}
