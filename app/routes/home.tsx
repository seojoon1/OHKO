import { useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/home";
import { FormatToggle } from "~/components/FormatToggle";
import { MyPokemonForm } from "~/components/MyPokemonForm";
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
  const [weather, setWeather] = useState<Weather>();

  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">OHKO</h1>
        <div className="flex items-center gap-4">
          <Link to={`/ranking?format=${format}`} className="text-sm text-blue-600">
            사용률 순위
          </Link>
          <FormatToggle format={format} />
        </div>
      </div>

      <MyPokemonForm value={myPokemon} onChange={setMyPokemon} />

      <div className="mt-6 mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          사용률 상위 {OPPONENT_COUNT}마리의 공격을 버틸 수 있을까?
        </h2>
        <WeatherSelect value={weather} onChange={setWeather} />
      </div>
      {myPokemon ? (
        <SurvivalTable
          myPokemon={myPokemon}
          opponents={opponents}
          format={format}
          weather={weather}
        />
      ) : (
        <p className="text-sm text-gray-500">
          내 포켓몬을 고르면 상위권 포켓몬의 주력 기술 4개를 버티는지 계산합니다.
        </p>
      )}
    </main>
  );
}
