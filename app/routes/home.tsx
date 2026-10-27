import { useState } from "react";

import type { Route } from "./+types/home";
import { BulkSummary } from "~/components/BulkSummary";
import { DuelResults } from "~/components/DuelResults";
import {
  type CustomOpponent,
  CustomOpponents,
  emptyCustomOpponent,
  toOpponentSets,
} from "~/components/CustomOpponents";
import { FormatToggle } from "~/components/FormatToggle";
import { HpControl } from "~/components/HpControl";
import { EMPTY_POKEMON, MyPokemonForm } from "~/components/MyPokemonForm";
import { OpponentEditor } from "~/components/OpponentEditor";
import {
  type OpponentMode,
  OpponentModeTabs,
} from "~/components/OpponentModeTabs";
import { SampleOpponents } from "~/components/SampleOpponents";
import { SurvivalTable } from "~/components/SurvivalTable";
import { WeatherBackground } from "~/components/WeatherBackground";
import { WeatherSelect } from "~/components/WeatherSelect";
import { useSampleOpponents } from "~/hooks/useSampleOpponents";
import { useTopOpponents } from "~/hooks/useTopOpponents";
import { toFormat } from "~/lib/champions.server";
import type { PokemonInput, Weather } from "~/types/damage";

// 날씨 배경 위에서도 읽히도록 반투명 흰 카드로 감싼다.
const CARD = "rounded-lg bg-white/85 p-4 shadow-sm backdrop-blur-sm";

export function meta({}: Route.MetaArgs) {
  return [{ title: "OHKO" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  // 상위 20위 세팅은 탭을 열 때 /api/opponents 로 따로 불러온다 (외부 API 20번 호출을 기다리지 않게).
  return { format };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { format } = loaderData;
  const [myPokemon, setMyPokemon] = useState<PokemonInput | null>(null);
  const [mode, setMode] = useState<OpponentMode>("duel");
  const [duelOpponent, setDuelOpponent] = useState<PokemonInput | null>(null);
  const [weather, setWeather] = useState<Weather>();

  const sample = useSampleOpponents(format);
  const top = useTopOpponents(format, mode === "top");
  const [customs, setCustoms] = useState<CustomOpponent[]>([
    emptyCustomOpponent(1),
  ]);

  const modeOpponents =
    mode === "top"
      ? top?.status === "done"
        ? top.opponents
        : []
      : mode === "sample"
        ? sample.opponents
        : toOpponentSets(customs);

  return (
    <main className="mx-auto max-w-7xl p-4">
      <WeatherBackground weather={weather} />
      <div className="mb-4 flex justify-end">
        <FormatToggle format={format} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className={`space-y-2 lg:sticky lg:top-4 lg:self-start ${CARD}`}>
          <h2 className="font-semibold">내 포켓몬</h2>
          <MyPokemonForm value={myPokemon} onChange={setMyPokemon} />
          <HpControl
            pokemon={myPokemon ?? EMPTY_POKEMON}
            onChange={setMyPokemon}
          />
          {myPokemon?.name && <BulkSummary pokemon={myPokemon} />}
        </section>

        <section className={`space-y-3 ${CARD}`}>
          <OpponentModeTabs value={mode} onChange={setMode} />
          {mode === "duel" && (
            <>
              <OpponentEditor
                value={duelOpponent}
                onChange={setDuelOpponent}
                format={format}
              />
              <HpControl
                pokemon={duelOpponent ?? EMPTY_POKEMON}
                onChange={setDuelOpponent}
              />
            </>
          )}
          {mode === "sample" && <SampleOpponents sample={sample} />}
          {mode === "custom" && (
            <CustomOpponents value={customs} onChange={setCustoms} />
          )}
          <div className="flex justify-end">
            <WeatherSelect value={weather} onChange={setWeather} />
          </div>

          {!myPokemon?.name ? (
            <p className="text-sm text-gray-500">
              왼쪽에서 내 포켓몬을 고르면 데미지를 계산합니다.
            </p>
          ) : mode === "duel" ? (
            duelOpponent?.name ? (
              <DuelResults
                me={myPokemon}
                opponent={duelOpponent}
                format={format}
                weather={weather}
              />
            ) : (
              <p className="text-sm text-gray-500">상대 포켓몬을 골라 주세요.</p>
            )
          ) : mode === "top" && top?.status !== "done" ? (
            <p className="text-sm text-gray-500">
              {top?.status === "error"
                ? `${top.message} 탭을 다시 열면 다시 시도합니다.`
                : "상위 20위 세팅을 불러오는 중…"}
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
