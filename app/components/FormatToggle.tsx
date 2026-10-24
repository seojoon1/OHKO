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
    <div className="flex overflow-hidden rounded border border-gray-300 text-sm dark:border-gray-700">
      {OPTIONS.map((option) => (
        <Link
          key={option.format}
          to={`${pathname}?format=${option.format}`}
          className={
            option.format === format
              ? "bg-gray-900 px-3 py-1 text-white dark:bg-gray-100 dark:text-gray-900"
              : "px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
          aria-current={option.format === format ? "page" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
