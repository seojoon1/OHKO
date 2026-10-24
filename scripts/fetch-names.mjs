// PokéAPI에서 챔피언스 포켓몬/기술/도구/특성/성격의 한글 이름을 모아 정적 JSON으로 만드는 스크립트.
// rand_poki 의 fetch-pokemon.mjs 방식(캐시 + 동시 요청 제한 + 재시도)을 따른다.
//
// 사용법: npm run fetch:names
// 출력:   data/{pokemon,moves,items,abilities,natures}.json  ({ showdownId: 한글 이름 })
// 캐시:   .cache/{endpoint}/{key}.json (있으면 네트워크 건너뜀)
//
// 주의: 런타임에 PokéAPI를 호출하지 않는다. 빌드 전 1회성 스크립트.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Generations, toID } from "@smogon/calc";

// ── 설정 ─────────────────────────────────────────────────────────────
const BASE = "https://pokeapi.co/api/v2";
const CONCURRENCY = 10; // 동시 요청 제한
const MAX_RETRY = 3; // 지수 백오프 재시도 횟수

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".cache");
const DATA_DIR = path.join(ROOT, "data");

// 수집 대상 = 데미지 계산기(@smogon/calc)가 받는 챔피언스 데이터.
// 이름이 통계 API와 같은 Showdown 표기라 둘 다 이 데이터로 한글화할 수 있다.
const gen = Generations.get(0);

// Showdown ID → PokéAPI 슬러그. 기호만 빼서는 맞지 않는 것들.
// PokéAPI 는 기본 폼에도 접미사를 붙이고("basculegion-male"), 옛 이름을 쓰는 경우가 있다("stick").
const ALIASES = {
  pokemon: {
    aegislashboth: "aegislash-shield",
    basculegion: "basculegion-male",
    basculegionf: "basculegion-female",
    gourgeist: "gourgeist-average",
    indeedee: "indeedee-male",
    indeedeef: "indeedee-female",
    lycanroc: "lycanroc-midday",
    maushold: "maushold-family-of-three",
    mausholdfour: "maushold-family-of-four",
    meowstic: "meowstic-male",
    meowsticf: "meowstic-female",
    meowsticmmega: "meowstic-male-mega",
    meowsticfmega: "meowstic-female-mega",
    mimikyu: "mimikyu-disguised",
    morpeko: "morpeko-full-belly",
    palafin: "palafin-zero",
    pyroar: "pyroar-male",
    squawkabilly: "squawkabilly-green-plumage",
    squawkabillyblue: "squawkabilly-blue-plumage",
    squawkabillyyellow: "squawkabilly-yellow-plumage",
    squawkabillywhite: "squawkabilly-white-plumage",
    taurospaldeacombat: "tauros-paldea-combat-breed",
    taurospaldeablaze: "tauros-paldea-blaze-breed",
    taurospaldeaaqua: "tauros-paldea-aqua-breed",
    toxtricity: "toxtricity-amped",
    // 외형만 다른 폼은 /pokemon 이 없어 원종을 가리키고, 폼은 COSMETIC_FORMS 로 지정한다.
    polteageistantique: "polteageist",
    sinistchamasterpiece: "sinistcha",
    vivillonfancy: "vivillon",
    vivillonpokeball: "vivillon",
  },
  item: {
    leek: "stick",
  },
};

// PokéAPI 에 한글 폼 이름이 없어 직접 정한 이름 (Showdown ID → 한글)
const POKEMON_KO = {
  aegislashboth: "킬가르도",
  basculegionf: "대쓰여너(암컷의 모습)",
  palafinhero: "돌핀맨(히어로의 모습)",
  squawkabillyblue: "시비꼬(파란 깃털)",
  squawkabillyyellow: "시비꼬(노란 깃털)",
  squawkabillywhite: "시비꼬(흰 깃털)",
  taurospaldeacombat: "켄타로스(팔데아·컴뱃종)",
  taurospaldeablaze: "켄타로스(팔데아·블레이즈종)",
  taurospaldeaaqua: "켄타로스(팔데아·워터종)",
  mausholdfour: "파밀리쥐(네 식구)",
  polteageistantique: "포트데스(진품)",
  meowsticmmega: "메가냐오닉스(수컷)",
  meowsticfmega: "메가냐오닉스(암컷)",
};

// 리전폼 라벨 폴백 (PokéAPI 에 ko 가 없는 폼용)
const REGION_KO = {
  Alola: "알로라의 모습",
  Galar: "가라르의 모습",
  Hisui: "히스이의 모습",
  Paldea: "팔데아의 모습",
};

// Showdown ID → PokéAPI pokemon-form 슬러그 (외형만 다른 폼)
const COSMETIC_FORMS = {
  polteageistantique: "polteageist-antique",
  sinistchamasterpiece: "sinistcha-masterpiece",
  vivillonfancy: "vivillon-fancy",
  vivillonpokeball: "vivillon-poke-ball",
};

// ── 세마포어 (동시 요청 제한) ─────────────────────────────────────────
class Semaphore {
  #max;
  #active = 0;
  #queue = [];
  constructor(max) {
    this.#max = max;
  }
  async run(fn) {
    if (this.#active >= this.#max) {
      await new Promise((resolve) => this.#queue.push(resolve));
    }
    this.#active++;
    try {
      return await fn();
    } finally {
      this.#active--;
      this.#queue.shift()?.();
    }
  }
}

const sem = new Semaphore(CONCURRENCY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 캐시 있는 fetch (지수 백오프 재시도) ──────────────────────────────
// transform: 네트워크 응답을 캐시에 저장하기 전 추려낼 함수
async function fetchCached(endpoint, key, transform, url) {
  const dir = path.join(CACHE_DIR, endpoint);
  const file = path.join(dir, `${key}.json`);
  if (existsSync(file)) return JSON.parse(await readFile(file, "utf8"));

  return sem.run(async () => {
    const target = url ?? `${BASE}/${endpoint}/${key}`;
    let lastErr;
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      try {
        const res = await fetch(target);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${target}`);
        const data = transform(await res.json());
        await mkdir(dir, { recursive: true });
        await writeFile(file, JSON.stringify(data));
        return data;
      } catch (err) {
        lastErr = err;
        if (attempt < MAX_RETRY) await sleep(500 * 2 ** attempt);
      }
    }
    throw lastErr;
  });
}

// names[] 에서 한국어 이름만 꺼낸다. 없으면 null.
function koName(names) {
  return names?.find((n) => n.language.name === "ko")?.name ?? null;
}

const slimNames = (json) => ({ ko: koName(json.names) });

// 목록 엔드포인트 → Map<showdownId, PokéAPI 슬러그>
// PokéAPI 슬러그("will-o-wisp")에서 기호를 빼면 Showdown ID("willowisp")와 같다.
async function slugMap(endpoint) {
  const list = await fetchCached(
    endpoint,
    "_index",
    (json) => json.results.map((r) => r.name),
    `${BASE}/${endpoint}?limit=5000`,
  );
  return new Map(list.map((slug) => [toID(slug), slug]));
}

// ── 종류별 수집 ──────────────────────────────────────────────────────
// 반환: { names: { showdownId: 한글 }, unmatched: [영문], noKo: [영문] }
async function collect(entries, endpoint, resolveKo) {
  const slugs = await slugMap(endpoint);
  const aliases = ALIASES[endpoint] ?? {};
  const names = {};
  const unmatched = [];
  const noKo = [];

  await Promise.all(
    entries.map(async (entry) => {
      const { name } = entry;
      const id = toID(name);
      const slug = aliases[id] ?? slugs.get(id);
      if (!slug) return unmatched.push(name);
      const ko = await resolveKo(slug, entry);
      if (ko) names[id] = ko;
      else noKo.push(name);
    }),
  );

  return { names: sortKeys(names), unmatched, noKo };
}

const simpleKo = (endpoint) => async (slug) =>
  (await fetchCached(endpoint, slug, slimNames)).ko;

// 포켓몬 이름 우선순위
//   1) 직접 정한 이름 (POKEMON_KO)
//   2) 폼 전체 이름 ("메가한카리아스")
//   3) 폼 라벨 – 종 이름이 들어 있으면 그대로("워시로토무"), 아니면 덧붙임("비비용(팬시한 모양)")
//   4) Showdown 폼으로 추론 – 메가("메가한카리아스Z"), 리전폼("윈디(히스이의 모습)")
//   5) 종 이름 ("한카리아스")
async function pokemonKo(slug, { name, baseSpecies }) {
  const id = toID(name);
  // "Garchomp-Mega-Z" - "Garchomp" → "Mega-Z"
  const forme = baseSpecies ? name.slice(baseSpecies.length + 1) : "";
  if (POKEMON_KO[id]) return POKEMON_KO[id];

  const pokemon = await fetchCached("pokemon", slug, (json) => ({
    species: json.species.name,
    form: json.forms[0]?.name,
  }));
  const speciesKo = (
    await fetchCached("pokemon-species", pokemon.species, slimNames)
  ).ko;
  if (!speciesKo) return null;

  const formSlug = COSMETIC_FORMS[id] ?? pokemon.form;
  if (formSlug) {
    const form = await fetchCached("pokemon-form", formSlug, (json) => ({
      ko: koName(json.names),
      label: koName(json.form_names),
    }));
    if (form.ko) return form.ko;
    // 기본 폼 라벨 "로토무의 모습"은 이름이 아니므로 종 이름을 쓴다.
    if (form.label === `${speciesKo}의 모습`) return speciesKo;
    if (form.label) {
      return form.label.includes(speciesKo)
        ? form.label
        : `${speciesKo}(${form.label})`;
    }
  }

  if (forme.startsWith("Mega")) {
    return `메가${speciesKo}${forme.replace(/^Mega-?/, "")}`;
  }
  if (REGION_KO[forme]) return `${speciesKo}(${REGION_KO[forme]})`;
  return speciesKo;
}

function sortKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
}

// @smogon/calc 에는 없지만 통계 API가 쓰는 ID (Showdown ID → 한글)
// 통계 API는 폼을 오가는 킬가르도를 기본 ID 하나로 집계한다.
const EXTRA_POKEMON_KO = {
  aegislash: "킬가르도",
};

// ── 실행 ─────────────────────────────────────────────────────────────
const TARGETS = [
  ["pokemon", [...gen.species], "pokemon", pokemonKo, EXTRA_POKEMON_KO],
  ["moves", [...gen.moves], "move", simpleKo("move")],
  ["items", [...gen.items], "item", simpleKo("item")],
  ["abilities", [...gen.abilities], "ability", simpleKo("ability")],
  ["natures", [...gen.natures], "nature", simpleKo("nature")],
];

await mkdir(DATA_DIR, { recursive: true });

for (const [file, entries, endpoint, resolveKo, extra = {}] of TARGETS) {
  const { names, unmatched, noKo } = await collect(
    entries,
    endpoint,
    resolveKo,
  );
  await writeFile(
    path.join(DATA_DIR, `${file}.json`),
    JSON.stringify(sortKeys({ ...names, ...extra }), null, 2) + "\n",
  );

  console.log(
    `${file}: ${Object.keys(names).length}/${entries.length}`,
  );
  if (unmatched.length) console.log(`  PokéAPI 매칭 실패: ${unmatched.join(", ")}`);
  if (noKo.length) console.log(`  한글 이름 없음: ${noKo.join(", ")}`);
}
