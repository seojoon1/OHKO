import { Link, useLocation } from "react-router";

import type { BattleFormat } from "~/types/champions";

const OPTIONS: { format: BattleFormat; label: string }[] = [
  { format: "Singles", label: "싱글" },
  { format: "Doubles", label: "더블" },
];

// 현재 페이지를 유지한 채 ?format= 만 바꾸는 싱글/더블 전환 버튼
export function FormatToggle({ format }: { format: BattleFormat }) {
  const { pathname } = useLocation();

  return (
    <div className="flex overflow-hidden rounded border border-gray-300 text-sm">
      {OPTIONS.map((option) => (
        <Link
          key={option.format}
          to={`${pathname}?format=${option.format}`}
          className={
            option.format === format
              ? "bg-accent px-3 py-1 font-semibold text-ink"
              : "px-3 py-1 hover:bg-accent-soft"
          }
          aria-current={option.format === format ? "page" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
