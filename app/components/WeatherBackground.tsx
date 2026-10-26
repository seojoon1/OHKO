import type { Weather } from "~/types/damage";

const LAYERS: { weather: Weather; className: string }[] = [
  { weather: "Sun", className: "weather-sun" },
  { weather: "Rain", className: "weather-rain" },
  { weather: "Sand", className: "weather-sand" },
  { weather: "Snow", className: "weather-snow" },
];

// 페이지 뒤에 깔리는 날씨 배경. 날씨마다 층을 하나씩 두고 고른 층만 보이게 해서
// 날씨를 바꾸면 서서히 전환된다. 날씨가 없으면(자동) 기본 흰 배경.
// 스타일은 app.css 의 .weather-* 참고.
export function WeatherBackground({ weather }: { weather?: Weather }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {LAYERS.map((layer) => (
        <div
          key={layer.weather}
          data-active={layer.weather === weather}
          className={`weather-layer ${layer.className}`}
        >
          <div className="weather-fx" />
        </div>
      ))}
    </div>
  );
}
