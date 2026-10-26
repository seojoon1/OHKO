import { chosenMoves } from "~/components/MoveSlots";
import { MyPokemonForm } from "~/components/MyPokemonForm";
import { toMega } from "~/lib/mega";
import { toKoName } from "~/lib/names";
import type { PokemonInput } from "~/types/damage";
import type { OpponentSet } from "~/types/opponent";

export interface CustomOpponent {
  id: number;
  /** 기술도 pokemon.moves 에 들어 있다 */
  pokemon: PokemonInput | null;
}

export function emptyCustomOpponent(id: number): CustomOpponent {
  return { id, pokemon: null };
}

// 입력값(PokemonInput) → 결과 표용 OpponentSet. 포켓몬과 기술 1개 이상이 있어야 한다.
export function toOpponentSet(pokemon: PokemonInput | null): OpponentSet | null {
  const moves = chosenMoves(pokemon?.moves);
  if (!pokemon?.name || moves.length === 0) return null;
  const { name, ability } = toMega(pokemon.name, pokemon.item, pokemon.ability);
  return {
    name,
    koName: toKoName("pokemon", name),
    ability,
    item: pokemon.item,
    sp: pokemon.sp ?? {},
    moves: moves.map((move) => ({
      name: move,
      koName: toKoName("move", move),
      nature: pokemon.nature,
    })),
  };
}

export function toOpponentSets(customs: CustomOpponent[]): OpponentSet[] {
  return customs.flatMap(({ pokemon }) => {
    const set = toOpponentSet(pokemon);
    return set ? [set] : [];
  });
}

interface Props {
  value: CustomOpponent[];
  onChange: (value: CustomOpponent[]) => void;
}

export function CustomOpponents({ value, onChange }: Props) {
  const update = (id: number, pokemon: PokemonInput) =>
    onChange(value.map((item) => (item.id === id ? { ...item, pokemon } : item)));

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
              className="text-sm text-gray-500 hover:text-ink"
            >
              상대 빼기 ×
            </button>
          </div>
          <MyPokemonForm
            value={custom.pokemon}
            onChange={(pokemon) => update(custom.id, pokemon)}
            placeholder="상대 포켓몬 검색"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyCustomOpponent(nextId)])}
        className="w-full rounded border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:text-ink"
      >
        + 상대 추가
      </button>
    </div>
  );
}
