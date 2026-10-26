import { Generations, toID, type StatID } from "@smogon/calc";

import { fieldClass, PokemonPicker } from "~/components/PokemonPicker";
import { SearchSelect } from "~/components/SearchSelect";
import { toKoName } from "~/lib/names";
import type { PokemonInput } from "~/types/damage";

const gen = Generations.get(0);

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

const NATURES = [...gen.natures]
  .map((nature) => ({
    value: nature.name,
    label:
      nature.plus === nature.minus || !nature.plus || !nature.minus
        ? toKoName("nature", nature.name)
        : `${toKoName("nature", nature.name)} (+${STAT_KO[nature.plus]} -${STAT_KO[nature.minus]})`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

// @smogon/calc 의 챔피언스 데이터는 포켓몬마다 첫 특성만 갖고 있어서, 전체 특성에서 고른다.
const ABILITIES = [...gen.abilities]
  .map((ability) => ({
    value: ability.name,
    label: toKoName("ability", ability.name),
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

const ITEMS = [...gen.items]
  .map((item) => ({ value: item.name, label: toKoName("item", item.name) }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

function abilitiesOf(name: string) {
  const species = gen.species.get(toID(name) as never);
  return Object.values(species?.abilities ?? {}).filter(Boolean);
}

function spTotal(sp: PokemonInput["sp"] = {}) {
  return Object.values(sp).reduce((sum, value) => sum + (value ?? 0), 0);
}

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
  const remaining = SP_MAX_TOTAL - spTotal(value?.sp);

  function selectPokemon(name: string) {
    onChange({ name, ability: abilitiesOf(name)[0], sp: {} });
  }

  function setStat(stat: StatID, raw: number) {
    if (!value) return;
    const current = value.sp?.[stat] ?? 0;
    // 능력치당 32, 합계 66을 넘지 않게 자른다.
    const limit = Math.min(SP_MAX_PER_STAT, current + remaining);
    const next = Math.max(0, Math.min(limit, Math.floor(raw) || 0));
    onChange({ ...value, sp: { ...value.sp, [stat]: next } });
  }

  return (
    <section className="space-y-3 rounded border border-gray-200 p-4">
      <PokemonPicker
        onSelect={selectPokemon}
        placeholder={
          value ? toKoName("pokemon", value.name) : placeholder
        }
      />

      {value && (
        <>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              성격
              <SearchSelect
                options={NATURES}
                value={value.nature}
                onChange={(nature) => onChange({ ...value, nature })}
                emptyLabel="선택 안 함"
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              특성
              <SearchSelect
                options={ABILITIES}
                value={value.ability}
                onChange={(ability) => onChange({ ...value, ability })}
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              도구
              <SearchSelect
                options={ITEMS}
                value={value.item}
                onChange={(item) => onChange({ ...value, item })}
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
                    value={value.sp?.[stat.id] ?? 0}
                    onChange={(event) =>
                      setStat(stat.id, Number(event.target.value))
                    }
                    className={`${fieldClass} w-full`}
                  />
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
