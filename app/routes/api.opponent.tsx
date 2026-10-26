// GET /api/opponent/:name?format=Singles → 그 포켓몬의 통계 1위 세팅 (OpponentSet)
import type { Route } from "./+types/api.opponent";
import { toFormat } from "~/lib/champions.server";
import { getOpponent } from "~/lib/opponents.server";

// 문서가 아닌 JSON 응답이라 entry.server 의 보안 헤더가 붙지 않는다.
const headers = { "X-Content-Type-Options": "nosniff" };

export async function loader({ params, request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  const opponent = await getOpponent(format, params.name);
  if (!opponent) {
    return Response.json(
      { error: "통계 데이터가 없는 포켓몬입니다." },
      { status: 404, headers },
    );
  }
  return Response.json(opponent, { headers });
}
