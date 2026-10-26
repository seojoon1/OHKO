import { chosenMoves } from "~/components/MoveSlots";
import { calcDamage } from "~/lib/damage";
import { toMega } from "~/lib/mega";
import { toKoName } from "~/lib/names";
import { judge, VERDICT_STYLE, WEATHER_BY_ABILITY } from "~/lib/verdict";
import type { BattleFormat } from "~/types/champions";
import type { PokemonInput, Weather } from "~/types/damage";

// 메가스톤을 들면 메가 폼과 그 특성으로 계산한다.
function withMega(pokemon: PokemonInput): PokemonInput {
  return { ...pokemon, ...toMega(pokemon.name, pokemon.item, pokemon.ability) };
}

interface Props {
  me: PokemonInput;
  opponent: PokemonInput;
  format: BattleFormat;
  /** 고른 날씨. 없으면 상대의 날씨 특성, 상대에게 없으면 내 날씨 특성 */
  weather?: Weather;
}

// 1대1 결과: 내 기술 → 상대, 상대 기술 → 나
export function DuelResults({ me, opponent, format, weather }: Props) {
  const mine = withMega(me);
  const theirs = withMega(opponent);
  const fieldWeather =
    weather ??
    (theirs.ability ? WEATHER_BY_ABILITY[theirs.ability] : undefined) ??
    (mine.ability ? WEATHER_BY_ABILITY[mine.ability] : undefined);

  return (
    <div className="space-y-4">
      <MoveTable
        title={`내 ${toKoName("pokemon", mine.name)} → 상대 ${toKoName("pokemon", theirs.name)}`}
        attacker={mine}
        defender={theirs}
        format={format}
        weather={fieldWeather}
      />
      <MoveTable
        title={`상대 ${toKoName("pokemon", theirs.name)} → 내 ${toKoName("pokemon", mine.name)}`}
        attacker={theirs}
        defender={mine}
        format={format}
        weather={fieldWeather}
      />
    </div>
  );
}

interface MoveTableProps {
  title: string;
  attacker: PokemonInput;
  defender: PokemonInput;
  format: BattleFormat;
  weather?: Weather;
}

function MoveTable({ title, attacker, defender, format, weather }: MoveTableProps) {
  const moves = chosenMoves(attacker.moves);

  return (
    <section>
      <h3 className="mb-1 font-semibold">{title}</h3>
      {moves.length === 0 ? (
        <p className="text-sm text-gray-500">기술을 골라 주세요.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-300">
            <tr>
              <th className="py-2 pr-2">기술</th>
              <th className="py-2 pr-2">데미지</th>
              <th className="py-2">판정</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move, index) => {
              const { result, error } = calcDamage({
                attacker,
                defender,
                move: { name: move },
                field: { format, weather },
              });
              const judgement = result
                ? judge(result.ko.n, result.ko.chance, result.range[1])
                : null;
              return (
                <tr key={`${index}-${move}`} className="border-b border-gray-100">
                  <td className="py-1 pr-2">{toKoName("move", move)}</td>
                  <td className="py-1 pr-2">
                    {result ? `${result.percent[0]} – ${result.percent[1]}%` : "-"}
                  </td>
                  <td
                    className={`py-1 ${judgement ? VERDICT_STYLE[judgement.verdict] : ""}`}
                  >
                    {judgement?.hits ?? error}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
