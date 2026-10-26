import type { Weather } from "~/types/damage";

const OPTIONS: { weather?: Weather; label: string }[] = [
  { label: "자동" },
  { weather: "Sun", label: "쾌청" },
  { weather: "Rain", label: "비" },
  { weather: "Sand", label: "모래바람" },
  { weather: "Snow", label: "설경" },
];

interface Props {
  value?: Weather;
  onChange: (weather: Weather | undefined) => void;
}

// "자동"이면 상대의 날씨 특성(가뭄 등)을 따른다.
export function WeatherSelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>날씨</span>
      <div className="flex overflow-hidden rounded border border-gray-300">
        {OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.weather)}
            aria-pressed={option.weather === value}
            className={
              option.weather === value
                ? "bg-accent px-3 py-1 font-semibold text-ink"
                : "px-3 py-1 hover:bg-accent-soft"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
