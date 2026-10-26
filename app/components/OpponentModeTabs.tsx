export type OpponentMode = "duel" | "top" | "sample" | "custom";

const TABS: { mode: OpponentMode; label: string }[] = [
  { mode: "duel", label: "1대1" },
  { mode: "top", label: "상위 20위" },
  { mode: "sample", label: "자동 샘플" },
  { mode: "custom", label: "사용자 지정" },
];

interface Props {
  value: OpponentMode;
  onChange: (mode: OpponentMode) => void;
}

export function OpponentModeTabs({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      className="flex border-b border-gray-200 text-sm"
    >
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          role="tab"
          aria-selected={tab.mode === value}
          onClick={() => onChange(tab.mode)}
          className={
            tab.mode === value
              ? "-mb-px border-b-2 border-accent px-4 py-2 font-semibold text-ink"
              : "px-4 py-2 text-gray-500 hover:text-ink"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
