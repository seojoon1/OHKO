import { Generations } from "@smogon/calc";

import { MyPokemonForm } from "~/components/MyPokemonForm";
import { fieldClass } from "~/components/PokemonPicker";
import { SearchSelect } from "~/components/SearchSelect";
import { toMega } from "~/lib/mega";
import { toKoName } from "~/lib/names";
import type { PokemonInput } from "~/types/damage";
import type { OpponentSet } from "~/types/opponent";

const gen = Generations.get(0);

export const MOVE_SLOTS = 4;

// 공격 기술만 (변화기는 데미지가 없다)
const ATTACK_MOVES = [...gen.moves]
  .filter((move) => move.category === "Physical" || move.category === "Special")
  .map((move) => ({ value: move.name, label: toKoName("move", move.name) }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

export interface CustomOpponent {
  id: number;
  pokemon: PokemonInput | null;
  moves: (string | undefined)[];
}

export function emptyCustomOpponent(id: number): CustomOpponent {
  return { id, pokemon: null, moves: Array(MOVE_SLOTS).fill(undefined) };
}

// 계산할 수 있는 상대(포켓몬과 기술 1개 이상)만 OpponentSet 으로 바꾼다.
export function toOpponentSets(customs: CustomOpponent[]): OpponentSet[] {
  return customs.flatMap(({ pokemon, moves }) => {
    const chosen = moves.filter((move): move is string => Boolean(move));
    if (!pokemon || chosen.length === 0) return [];
    const { name, ability } = toMega(pokemon.name, pokemon.item, pokemon.ability);
    return [
      {
        name,
        koName: toKoName("pokemon", name),
        ability,
        item: pokemon.item,
        sp: pokemon.sp ?? {},
        moves: chosen.map((move) => ({
          name: move,
          koName: toKoName("move", move),
          nature: pokemon.nature,
        })),
      },
    ];
  });
}

interface Props {
  value: CustomOpponent[];
  onChange: (value: CustomOpponent[]) => void;
}

export function CustomOpponents({ value, onChange }: Props) {
  const update = (id: number, patch: Partial<CustomOpponent>) =>
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const nextId = Math.max(0, ...value.map((item) => item.id)) + 1;

  return (
    <div className="space-y-3">
      {value.map((custom) => (
        <div key={custom.id} className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                onChange(value.filter((item) => item.id !== custom.id))
              }
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            >
              상대 빼기 ×
            </button>
          </div>
          <MyPokemonForm
            value={custom.pokemon}
            onChange={(pokemon) => update(custom.id, { pokemon })}
            placeholder="상대 포켓몬 검색"
          />
          {custom.pokemon && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {custom.moves.map((move, slot) => (
                <div key={slot} className="flex flex-col gap-1">
                  기술 {slot + 1}
                  <SearchSelect
                    options={ATTACK_MOVES}
                    value={move}
                    onChange={(next) =>
                      update(custom.id, {
                        moves: custom.moves.map((item, i) =>
                          i === slot ? next : item,
                        ),
                      })
                    }
                    emptyLabel="없음"
                    className={fieldClass}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyCustomOpponent(nextId)])}
        className="w-full rounded border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:hover:text-gray-100"
      >
        + 상대 추가
      </button>
    </div>
  );
}
