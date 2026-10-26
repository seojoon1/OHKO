import { calcBulk } from "~/lib/bulk";
import type { PokemonInput } from "~/types/damage";

const format = (value: number) => value.toLocaleString("ko-KR");

// 내 포켓몬의 물리/특수 내구 지수 (HP × 방어, HP × 특방)
export function BulkSummary({ pokemon }: { pokemon: PokemonInput }) {
  const bulk = calcBulk(pokemon);
  if (!bulk) return null;

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="rounded border border-gray-200 p-3">
        <div className="text-gray-500">물리내구</div>
        <div className="text-xl font-bold">{format(bulk.physical)}</div>
        <div className="text-xs text-gray-500">
          H {bulk.hp} × B {bulk.def}
        </div>
      </div>
      <div className="rounded border border-gray-200 p-3">
        <div className="text-gray-500">특수내구</div>
        <div className="text-xl font-bold">{format(bulk.special)}</div>
        <div className="text-xs text-gray-500">
          H {bulk.hp} × D {bulk.spd}
        </div>
      </div>
    </div>
  );
}
