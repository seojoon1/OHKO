import { type ComponentType, useEffect, useState } from "react";

import type { Weather } from "~/types/damage";

import { WEATHER_PARTICLES } from "./weatherParticles";

const LAYERS: { weather: Weather; className: string }[] = [
  { weather: "Sun", className: "weather-sun" },
  { weather: "Rain", className: "weather-rain" },
  { weather: "Sand", className: "weather-sand" },
  { weather: "Snow", className: "weather-snow" },
];

type ParticlesComponent = ComponentType<{
  id?: string;
  className?: string;
  options?: object;
}>;

// tsParticles 는 브라우저 전용이라 서버 렌더링 때는 불러오지 않는다.
// Particles 는 ParticlesProvider 가 플러그인(slim, wobble)을 등록한 뒤에야 그려진다.
// Provider 의 init 은 앱 전체에서 같은 함수여야 해서 한 번만 만든다.
let particlesPromise: Promise<ParticlesComponent> | undefined;

function loadParticles() {
  particlesPromise ??= (async () => {
    const [{ loadSlim }, { loadWobbleUpdater }, { Particles, ParticlesProvider }] =
      await Promise.all([
        import("@tsparticles/slim"),
        import("@tsparticles/updater-wobble"),
        import("@tsparticles/react"),
      ]);
    const init = async (engine: Parameters<typeof loadSlim>[0]) => {
      await loadSlim(engine);
      await loadWobbleUpdater(engine);
    };
    const WithProvider: ParticlesComponent = (props) => (
      <ParticlesProvider init={init}>
        <Particles {...props} />
      </ParticlesProvider>
    );
    return WithProvider;
  })();
  return particlesPromise;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// 페이지 뒤에 깔리는 날씨 배경.
// - 색 그라데이션: 날씨마다 층을 두고 고른 층만 보이게 해서 서서히 전환 (app.css .weather-*)
// - 움직이는 입자: tsParticles (빗줄기, 눈, 모래, 빛 알갱이)
// 날씨가 없으면(자동) 기본 흰 배경. 동작 줄이기 설정이면 입자를 띄우지 않는다.
export function WeatherBackground({ weather }: { weather?: Weather }) {
  const [Particles, setParticles] = useState<ParticlesComponent>();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!weather || reducedMotion || Particles) return;
    let cancelled = false;
    loadParticles().then((component) => {
      if (!cancelled) setParticles(() => component);
    });
    return () => {
      cancelled = true;
    };
  }, [weather, reducedMotion, Particles]);

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
        />
      ))}
      {weather && Particles && !reducedMotion && (
        // key 로 날씨가 바뀔 때마다 새로 띄우고, 나타날 때 서서히 보이게 한다.
        <div key={weather} className="weather-particles absolute inset-0">
          <Particles
            id={`weather-${weather}`}
            className="absolute inset-0"
            options={WEATHER_PARTICLES[weather]}
          />
        </div>
      )}
    </div>
  );
}
