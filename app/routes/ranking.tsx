import { Link } from "react-router";

import type { Route } from "./+types/ranking";
import { FormatToggle } from "~/components/FormatToggle";
import { getRanking, toFormat } from "~/lib/champions.server";
import { toKoName } from "~/lib/names";

export function meta({}: Route.MetaArgs) {
  return [{ title: "사용률 순위 – OHKO" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  const ranking = (await getRanking(format)).map((entry) => ({
    ...entry,
    name: toKoName("pokemon", entry.showdownId),
    move: entry.move && toKoName("move", entry.move),
    item: entry.item && toKoName("item", entry.item),
    ability: entry.ability && toKoName("ability", entry.ability),
    nature: entry.nature && toKoName("nature", entry.nature),
  }));
  return { format, ranking };
}

export default function Ranking({ loaderData }: Route.ComponentProps) {
  const { format, ranking } = loaderData;

  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">사용률 순위</h1>
        <FormatToggle format={format} />
      </div>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-300">
          <tr>
            <th className="py-2 pr-2">순위</th>
            <th className="py-2 pr-2">포켓몬</th>
            <th className="py-2 pr-2">기술</th>
            <th className="py-2 pr-2">도구</th>
            <th className="py-2 pr-2">특성</th>
            <th className="py-2">성격</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((entry) => (
            <tr
              key={entry.showdownId}
              className="border-b border-gray-100"
            >
              <td className="py-1 pr-2">{entry.position}</td>
              <td className="py-1 pr-2">
                <Link
                  to={`/pokemon/${entry.showdownId}?format=${format}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <img
                    src={entry.sprite}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                  {entry.name}
                </Link>
              </td>
              <td className="py-1 pr-2">{entry.move}</td>
              <td className="py-1 pr-2">{entry.item}</td>
              <td className="py-1 pr-2">{entry.ability}</td>
              <td className="py-1">{entry.nature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
