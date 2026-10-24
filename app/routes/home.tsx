import { Link } from "react-router";

import type { Route } from "./+types/home";
import { toFormat } from "~/lib/champions.server";
import { getOpponents } from "~/lib/opponents.server";

const OPPONENT_COUNT = 20;

export function meta({}: Route.MetaArgs) {
  return [{ title: "OHKO" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  return { format, opponents: await getOpponents(format, OPPONENT_COUNT) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { opponents } = loaderData;

  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">OHKO</h1>
        <Link to="/ranking" className="text-sm text-blue-600">
          사용률 순위 →
        </Link>
      </div>

      <h2 className="mb-2 font-semibold">상위 {OPPONENT_COUNT}마리 세팅</h2>
      <ol className="text-sm">
        {opponents.map((opponent) => (
          <li
            key={opponent.name}
            className="border-b border-gray-100 py-1 dark:border-gray-800"
          >
            {opponent.position}. {opponent.koName} –{" "}
            {opponent.moves.map((move) => move.koName).join(", ")}
          </li>
        ))}
      </ol>
    </main>
  );
}
