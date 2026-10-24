import { useState } from "react";

import { chosungIncludes } from "~/lib/hangul";

export interface SearchOption {
  value: string;
  label: string;
}

interface Props {
  options: SearchOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  /** 선택 해제 항목 라벨. 없으면 해제할 수 없다. */
  emptyLabel?: string;
  className?: string;
}

// 한글(초성 포함)로 걸러 고르는 선택 상자. 입력창을 누르면 전체 목록이 열린다.
export function SearchSelect({
  options,
  value,
  onChange,
  emptyLabel,
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) =>
    chosungIncludes(option.label, query),
  );

  function select(next: string | undefined) {
    onChange(next);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        value={open ? query : (selected?.label ?? "")}
        placeholder={selected?.label ?? emptyLabel ?? "검색"}
        onFocus={() => setOpen(true)}
        // 목록 클릭이 먼저 처리되도록 닫기를 늦춘다.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => setQuery(event.target.value)}
        className={`w-full ${className}`}
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded border border-gray-300 bg-white text-sm shadow dark:border-gray-700 dark:bg-gray-900">
          {emptyLabel && (
            <li>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(undefined)}
                className="w-full px-2 py-1 text-left text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {emptyLabel}
              </button>
            </li>
          )}
          {filtered.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option.value)}
                className="w-full px-2 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {option.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-2 py-1 text-gray-500">검색 결과 없음</li>
          )}
        </ul>
      )}
    </div>
  );
}
