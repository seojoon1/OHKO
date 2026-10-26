import { Generations } from "@smogon/calc";

import { fieldClass } from "~/components/PokemonPicker";
import { SearchSelect } from "~/components/SearchSelect";
import { toKoName } from "~/lib/names";

const gen = Generations.get(0);

export const MOVE_SLOTS = 4;

// 공격 기술만 (변화기는 데미지가 없다)
const ATTACK_MOVES = [...gen.moves]
  .filter((move) => move.category === "Physical" || move.category === "Special")
  .map((move) => ({ value: move.name, label: toKoName("move", move.name) }))
  .sort((a, b) => a.label.localeCompare(b.label, "ko"));

// 고른 기술만 (빈 칸 제외)
export function chosenMoves(moves: (string | undefined)[] = []) {
  return moves.filter((move): move is string => Boolean(move));
}

interface Props {
  moves?: (string | undefined)[];
  onChange: (moves: (string | undefined)[]) => void;
}

// 기술 4칸. 칸마다 공격 기술을 검색해 고른다.
export function MoveSlots({ moves = [], onChange }: Props) {
  const slots = Array.from({ length: MOVE_SLOTS }, (_, i) => moves[i]);

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {slots.map((move, slot) => (
        <div key={slot} className="flex flex-col gap-1">
          기술 {slot + 1}
          <SearchSelect
            options={ATTACK_MOVES}
            value={move}
            onChange={(next) =>
              onChange(slots.map((item, i) => (i === slot ? next : item)))
            }
            emptyLabel="없음"
            className={fieldClass}
          />
        </div>
      ))}
    </div>
  );
}
