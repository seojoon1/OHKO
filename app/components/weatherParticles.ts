// 날씨별 tsParticles 설정. 색 그라데이션은 app.css 의 .weather-* 가 맡고, 여기는 움직이는 입자만.
import type { ISourceOptions } from "@tsparticles/engine";

import type { Weather } from "~/types/damage";

const base: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: "transparent" },
  detectRetina: true,
  fpsLimit: 60,
  pauseOnBlur: true,
};

export const WEATHER_PARTICLES: Record<Weather, ISourceOptions> = {
  // 쾌청: 천천히 떠오르며 반짝이는 빛 알갱이
  Sun: {
    ...base,
    particles: {
      number: { value: 45, density: { enable: true } },
      shape: { type: "circle" },
      paint: { fill: { enable: true, color: { value: ["#fffbe6", "#ffe38a", "#ffffff"] } } },
      size: { value: { min: 1.5, max: 5 } },
      opacity: {
        value: { min: 0.1, max: 0.7 },
        animation: { enable: true, speed: 0.6, sync: false },
      },
      move: {
        enable: true,
        direction: "top",
        speed: { min: 0.2, max: 0.8 },
        random: true,
        straight: false,
        outModes: "out",
      },
      wobble: { enable: true, distance: 8, speed: { angle: 3, move: 3 } },
    },
  },

  // 비: 움직이는 방향으로 기운 빗줄기, 속도와 길이가 제각각
  Rain: {
    ...base,
    particles: {
      number: { value: 180, density: { enable: true } },
      shape: { type: "line" },
      paint: {
        stroke: { width: 1.2, color: { value: "#ffffff" } },
      },
      size: { value: { min: 6, max: 14 } },
      opacity: { value: { min: 0.25, max: 0.6 } },
      rotate: { path: true },
      move: {
        enable: true,
        direction: "bottom",
        angle: { value: 4, offset: 12 },
        speed: { min: 18, max: 28 },
        straight: true,
        outModes: "out",
      },
    },
  },

  // 모래바람: 옆으로 날리며 흔들리는 모래 알갱이
  Sand: {
    ...base,
    particles: {
      number: { value: 240, density: { enable: true } },
      shape: { type: "circle" },
      paint: {
        fill: { enable: true, color: { value: ["#a9803f", "#c9a463", "#e8d3a4", "#fff6e0"] } },
      },
      size: { value: { min: 0.6, max: 2.4 } },
      opacity: { value: { min: 0.3, max: 0.85 } },
      move: {
        enable: true,
        direction: "right",
        angle: { value: 20, offset: 6 },
        speed: { min: 5, max: 14 },
        straight: false,
        outModes: "out",
      },
      wobble: { enable: true, distance: 6, speed: { angle: 8, move: 6 } },
    },
  },

  // 설경: 크기·투명도가 다른 눈송이가 좌우로 흔들리며 천천히 내림
  Snow: {
    ...base,
    particles: {
      number: { value: 140, density: { enable: true } },
      shape: { type: "circle" },
      paint: { fill: { enable: true, color: { value: "#ffffff" } } },
      size: { value: { min: 1, max: 4.5 } },
      opacity: { value: { min: 0.5, max: 1 } },
      move: {
        enable: true,
        direction: "bottom",
        speed: { min: 0.6, max: 2 },
        straight: false,
        outModes: "out",
      },
      wobble: { enable: true, distance: 12, speed: { angle: 4, move: 6 } },
    },
  },
};
