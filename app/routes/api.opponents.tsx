// GET /api/opponents?format=Singles → 사용률 상위 20마리의 대표 세팅 (OpponentSet[])
// 메인 첫 응답이 외부 API 20번 호출을 기다리지 않도록, 상위 20위 탭을 열 때 따로 불러온다.
import type { Route } from "./+types/api.opponents";
import { toFormat } from "~/lib/champions.server";
import { getOpponents } from "~/lib/opponents.server";

const OPPONENT_COUNT = 20;

const headers = { "X-Content-Type-Options": "nosniff" };

export async function loader({ request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  try {
    return Response.json(await getOpponents(format, OPPONENT_COUNT), {
      headers,
    });
  } catch {
    return Response.json(
      { error: "통계 서버에 연결할 수 없습니다." },
      { status: 502, headers },
    );
  }
}
