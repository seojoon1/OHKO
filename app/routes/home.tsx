import type { Route } from "./+types/home";
import { getRanking, toFormat } from "~/lib/champions.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "OHKO" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  return { format, ranking: await getRanking(format) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { format, ranking } = loaderData;

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">{format} 사용률 순위</h1>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-300 dark:border-gray-700">
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
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <td className="py-1 pr-2">{entry.position}</td>
              <td className="py-1 pr-2">
                <span className="flex items-center gap-2">
                  <img
                    src={entry.sprite}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                  {entry.name}
                </span>
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
