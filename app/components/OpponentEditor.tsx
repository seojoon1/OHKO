import { useState } from "react";

import { MyPokemonForm } from "~/components/MyPokemonForm";
import type { BattleFormat } from "~/types/champions";
import type { PokemonInput } from "~/types/damage";
import type { OpponentSet } from "~/types/opponent";

// 통계 세팅 → 입력 폼 값. 기술마다 성격/포인트가 다를 수 있어 첫 기술 기준으로 한 벌을 만든다.
function fromOpponentSet(set: OpponentSet): PokemonInput {
  const first = set.moves[0];
  return {
    name: set.name,
    nature: first?.nature,
    ability: set.ability,
    item: set.item,
    sp: first?.sp ?? set.sp,
    moves: set.moves.map((move) => move.name),
  };
}

interface Props {
  value: PokemonInput | null;
  onChange: (value: PokemonInput) => void;
  format: BattleFormat;
}

type Status = "idle" | "loading" | "filled" | "missing";

// 1대1 상대 입력. 포켓몬을 고르면 통계 상위 세팅으로 채우고, 이후에는 자유롭게 고칠 수 있다.
export function OpponentEditor({ value, onChange, format }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleChange(next: PokemonInput) {
    onChange(next);
    if (!next.name || next.name === value?.name) return;

    // 포켓몬을 새로 고른 경우: 통계 세팅으로 채운다. 남은 HP/랭크는 그대로 둔다.
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/opponent/${encodeURIComponent(next.name)}?format=${format}`,
      );
      if (!res.ok) {
        setStatus("missing");
        return;
      }
      const set: OpponentSet = await res.json();
      onChange({
        ...fromOpponentSet(set),
        hpPercent: next.hpPercent,
        boosts: next.boosts,
      });
      setStatus("filled");
    } catch {
      setStatus("missing");
    }
  }

  return (
    <div className="space-y-2">
      <MyPokemonForm
        value={value}
        onChange={handleChange}
        placeholder="상대 포켓몬 검색 (통계 세팅이 채워짐)"
      />
      {status === "loading" && (
        <p className="text-sm text-gray-500">통계 세팅을 불러오는 중…</p>
      )}
      {status === "filled" && (
        <p className="text-sm text-gray-500">
          {format === "Doubles" ? "더블" : "싱글"} 통계 상위 세팅으로 채웠습니다.
          자유롭게 고칠 수 있습니다.
        </p>
      )}
      {status === "missing" && (
        <p className="text-sm text-gray-500">
          통계 데이터가 없는 포켓몬입니다. 직접 입력해 주세요.
        </p>
      )}
    </div>
  );
}
