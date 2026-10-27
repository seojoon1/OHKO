import { fieldClass } from "~/components/PokemonPicker";
import { useCalculator } from "~/hooks/useCalculator";
import type { PokemonInput } from "~/types/damage";

interface Props {
  pokemon: PokemonInput;
  onChange: (pokemon: PokemonInput) => void;
}

// 남은 HP(1~100%) 조절. 포켓몬을 고르면 실제 HP 값도 보여준다.
export function HpControl({ pokemon, onChange }: Props) {
  const percent = pokemon.hpPercent ?? 100;
  const calculator = useCalculator();
  // 계산기가 준비되기 전에는 실제 HP 값을 빼고 % 만 보여준다.
  const maxHP = pokemon.name ? calculator?.calcBulk(pokemon)?.hp : undefined;
  const currentHP =
    maxHP !== undefined
      ? Math.max(1, Math.floor((maxHP * percent) / 100))
      : undefined;

  const set = (raw: number) =>
    onChange({
      ...pokemon,
      hpPercent: Math.min(100, Math.max(1, Math.round(raw) || 1)),
    });

  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span>남은 HP</span>
        {currentHP !== undefined && (
          <span className="text-gray-500">
            {currentHP} / {maxHP}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={100}
          value={percent}
          onChange={(event) => set(Number(event.target.value))}
          aria-label="남은 HP 비율"
          className="flex-1 accent-accent"
        />
        <label className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(event) => set(Number(event.target.value))}
            className={`${fieldClass} w-16 text-right`}
          />
          %
        </label>
      </div>
    </div>
  );
}
