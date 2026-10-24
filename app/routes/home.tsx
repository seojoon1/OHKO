import { useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/home";
import { FormatToggle } from "~/components/FormatToggle";
import { MyPokemonForm } from "~/components/MyPokemonForm";
import {
  type OpponentMode,
  OpponentModeTabs,
} from "~/components/OpponentModeTabs";
import { SurvivalTable } from "~/components/SurvivalTable";
import { WeatherSelect } from "~/components/WeatherSelect";
import { toFormat } from "~/lib/champions.server";
import { getOpponents } from "~/lib/opponents.server";
import type { PokemonInput, Weather } from "~/types/damage";

const OPPONENT_COUNT = 20;

export function meta({}: Route.MetaArgs) {
  return [{ title: "OHKO" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  return { format, opponents: await getOpponents(format, OPPONENT_COUNT) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { format, opponents } = loaderData;
  const [myPokemon, setMyPokemon] = useState<PokemonInput | null>(null);
  const [mode, setMode] = useState<OpponentMode>("top");
  const [weather, setWeather] = useState<Weather>();

  // 모드별 상대 목록. 자동 샘플/사용자 지정은 다음 작업에서 채운다.
  const modeOpponents = mode === "top" ? opponents : [];

  return (
    <main className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">OHKO</h1>
        <div className="flex items-center gap-4">
          <Link
            to={`/ranking?format=${format}`}
            className="text-sm text-blue-600"
          >
            사용률 순위
          </Link>
          <FormatToggle format={format} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="space-y-2 lg:sticky lg:top-4 lg:self-start">
          <h2 className="font-semibold">내 포켓몬</h2>
          <MyPokemonForm value={myPokemon} onChange={setMyPokemon} />
        </section>

        <section className="space-y-3">
          <OpponentModeTabs value={mode} onChange={setMode} />
          <div className="flex justify-end">
            <WeatherSelect value={weather} onChange={setWeather} />
          </div>

          {!myPokemon ? (
            <p className="text-sm text-gray-500">
              왼쪽에서 내 포켓몬을 고르면 상대의 공격을 버티는지 계산합니다.
            </p>
          ) : modeOpponents.length === 0 ? (
            <p className="text-sm text-gray-500">상대를 추가해 주세요.</p>
          ) : (
            <SurvivalTable
              myPokemon={myPokemon}
              opponents={modeOpponents}
              format={format}
              weather={weather}
            />
          )}
        </section>
      </div>
    </main>
  );
}
