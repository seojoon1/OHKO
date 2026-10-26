import type { StatID } from "@smogon/calc";

import { MoveSlots } from "~/components/MoveSlots";
import { fieldClass, PokemonPicker } from "~/components/PokemonPicker";
import { RankControl } from "~/components/RankControl";
import { SearchSelect } from "~/components/SearchSelect";
import {
  ABILITIES as ABILITY_NAMES,
  findSpecies,
  ITEMS as ITEM_DATA,
  NATURES as NATURE_DATA,
} from "~/lib/championsData";
import { toKoName } from "~/lib/names";
import type { PokemonInput } from "~/types/damage";

// 챔피언스 능력 포인트 규칙
export const SP_MAX_PER_STAT = 32;
export const SP_MAX_TOTAL = 66;

const STATS: { id: StatID; label: string }[] = [
  { id: "hp", label: "H" },
  { id: "atk", label: "A" },
  { id: "def", label: "B" },
  { id: "spa", label: "C" },
  { id: "spd", label: "D" },
  { id: "spe", label: "S" },
];

const STAT_KO: Record<string, string> = {
  atk: "공격",
  def: "방어",
  spa: "특공",
  spd: "특방",
  spe: "스피드",
};

const NATURES = NATURE_DATA
  .map((nature) => ({
    value: nature.name,
    label:
      nature.plus === nature.minus || !nature.plus || !nature.minus
        ? toKoName("nature", nature.name)
        : `${toKoName("nature", nature.name)} (+${STAT_KO[nature.plus]} -${STAT_KO[nature.minus]})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

// @smogon/calc 의 챔피언스 데이터는 포켓몬마다 첫 특성만 갖고 있어서, 전체 특성에서 고른다.
const ABILITIES = ABILITY_NAMES.map((name) => ({
  value: name,
  label: toKoName("ability", name),
}))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

const ITEMS = ITEM_DATA
  .map((item) => ({ value: item.name, label: toKoName("item", item.name) }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

// 포켓몬의 기본 특성 (데이터에는 첫 특성만 있다)
function defaultAbility(name: string) {
  return findSpecies(name)?.ability ?? undefined;
}

function spTotal(sp: PokemonInput["sp"] = {}) {
  return Object.values(sp).reduce((sum, value) => sum + (value ?? 0), 0);
}

// 포켓몬을 고르기 전에도 성격/특성/도구/포인트를 먼저 입력할 수 있다. 이때 name 은 "".
export const EMPTY_POKEMON: PokemonInput = { name: "", sp: {} };

interface Props {
  value: PokemonInput | null;
  onChange: (value: PokemonInput) => void;
  /** 포켓몬 검색창 안내 문구 */
  placeholder?: string;
}

export function MyPokemonForm({
  value,
  onChange,
  placeholder = "내 포켓몬 검색 (예: ㅎㅋㄹ)",
}: Props) {
  const draft = value ?? EMPTY_POKEMON;
  const remaining = SP_MAX_TOTAL - spTotal(draft.sp);

  // 포켓몬을 바꿔도 입력해 둔 성격/도구/포인트는 두고, 특성만 그 포켓몬의 기본 특성으로 바꾼다.
  function selectPokemon(name: string) {
    onChange({ ...draft, name, ability: defaultAbility(name) });
  }

  function setStat(stat: StatID, raw: number) {
    const current = draft.sp?.[stat] ?? 0;
    // 능력치당 32, 합계 66을 넘지 않게 자른다.
    const limit = Math.min(SP_MAX_PER_STAT, current + remaining);
    const next = Math.max(0, Math.min(limit, Math.floor(raw) || 0));
    onChange({ ...draft, sp: { ...draft.sp, [stat]: next } });
  }

  return (
    <section className="space-y-3 rounded border border-gray-200 p-4">
      <PokemonPicker
        onSelect={selectPokemon}
        placeholder={
          draft.name ? toKoName("pokemon", draft.name) : placeholder
        }
      />

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          성격
          <SearchSelect
            options={NATURES}
            value={draft.nature}
            onChange={(nature) => onChange({ ...draft, nature })}
            emptyLabel="선택 안 함"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          특성
          <SearchSelect
            options={ABILITIES}
            value={draft.ability}
            onChange={(ability) => onChange({ ...draft, ability })}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          도구
          <SearchSelect
            options={ITEMS}
            value={draft.item}
            onChange={(item) => onChange({ ...draft, item })}
            emptyLabel="없음"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="text-sm">
        <div className="mb-1 flex justify-between">
          <span>능력 포인트</span>
          <span className="text-gray-500">
            남은 포인트 {remaining} / {SP_MAX_TOTAL}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {STATS.map((stat) => (
            <label key={stat.id} className="flex flex-col gap-1">
              {stat.label}
              <input
                type="number"
                min={0}
                max={SP_MAX_PER_STAT}
                value={draft.sp?.[stat.id] ?? 0}
                onChange={(event) =>
                  setStat(stat.id, Number(event.target.value))
                }
                className={`${fieldClass} w-full`}
              />
            </label>
          ))}
        </div>
      </div>

      <RankControl
        boosts={draft.boosts}
        onChange={(boosts) => onChange({ ...draft, boosts })}
      />

      <MoveSlots
        moves={draft.moves}
        onChange={(moves) => onChange({ ...draft, moves })}
      />
    </section>
  );
}
