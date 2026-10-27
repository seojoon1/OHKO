import { fieldClass } from "~/components/PokemonPicker";
import { SearchSelect } from "~/components/SearchSelect";
import { ATTACK_MOVES as ATTACK_MOVE_NAMES } from "~/lib/championsData";
import { toKoName } from "~/lib/names";

export const MOVE_SLOTS = 4;

// 공격 기술만 (변화기는 데미지가 없다)
const ATTACK_MOVES = ATTACK_MOVE_NAMES.map((name) => ({
  value: name,
  label: toKoName("move", name),
}))
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
