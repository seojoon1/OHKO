// GET /api/opponent/:name?format=Singles → 그 포켓몬의 통계 1위 세팅 (OpponentSet)
import type { Route } from "./+types/api.opponent";
import { toFormat } from "~/lib/champions.server";
import { getOpponent } from "~/lib/opponents.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  const opponent = await getOpponent(format, params.name);
  if (!opponent) {
    return Response.json(
      { error: "통계 데이터가 없는 포켓몬입니다." },
      { status: 404 },
    );
  }
  return Response.json(opponent);
}
