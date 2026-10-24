import { Link } from "react-router";

import type { Route } from "./+types/pokemon";
import { FormatToggle } from "~/components/FormatToggle";
import { getBattle, toFormat } from "~/lib/champions.server";
import { type NameKind, toKoName } from "~/lib/names";
import type { BattleCategory, BattleRow } from "~/types/champions";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.pokemon ?? "포켓몬"} – OHKO` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const format = toFormat(new URL(request.url).searchParams.get("format"));
  try {
    const battle = await getBattle(format, params.id);
    const rows = battle.rows.map((row) => {
      const kind = NAME_KIND[row.category];
      return kind ? { ...row, name: toKoName(kind, row.name) } : row;
    });
    return {
      format,
      pokemon: toKoName("pokemon", battle.showdownId),
      rows,
    };
  } catch {
    throw new Response("포켓몬을 찾을 수 없습니다.", { status: 404 });
  }
}

// 항목 → 한글 이름 종류 (stat_points 는 이름이 없다)
const NAME_KIND: Partial<Record<BattleCategory, NameKind>> = {
  move: "move",
  held_item: "item",
  ability: "ability",
  stat_alignment: "nature",
  teammate: "pokemon",
};

const STAT_KO: Record<string, string> = {
  Attack: "공격",
  Defense: "방어",
  "Sp. Atk": "특공",
  "Sp. Def": "특방",
  Speed: "스피드",
};

const SECTIONS: { category: BattleCategory; title: string }[] = [
  { category: "move", title: "기술" },
  { category: "held_item", title: "도구" },
  { category: "ability", title: "특성" },
  { category: "stat_alignment", title: "성격" },
  { category: "stat_points", title: "능력 포인트" },
  { category: "teammate", title: "동료" },
];

// stat_points 행 → "H2 A32 B0 C0 D0 S32"
function statPointsLabel(row: BattleRow) {
  return [
    `H${row.hp_points}`,
    `A${row.attack_points}`,
    `B${row.defense_points}`,
    `C${row.sp_atk_points}`,
    `D${row.sp_def_points}`,
    `S${row.speed_points}`,
  ].join(" ");
}

function rowLabel(row: BattleRow) {
  if (row.category === "stat_points") return statPointsLabel(row);
  if (row.category === "stat_alignment" && row.stat_up) {
    const up = STAT_KO[row.stat_up] ?? row.stat_up;
    const down = STAT_KO[row.stat_down] ?? row.stat_down;
    return `${row.name} (+${up} / -${down})`;
  }
  return row.name;
}

export default function Pokemon({ loaderData }: Route.ComponentProps) {
  const { format, pokemon, rows } = loaderData;

  return (
    <main className="mx-auto max-w-4xl p-4">
      <Link to={`/?format=${format}`} className="text-sm text-blue-600">
        ← 순위로
      </Link>
      <div className="my-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{pokemon}</h1>
        <FormatToggle format={format} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {SECTIONS.map(({ category, title }) => (
          <section key={category}>
            <h2 className="mb-2 font-semibold">{title}</h2>
            <ol className="text-sm">
              {rows
                .filter((row) => row.category === category)
                .map((row) => (
                  <li
                    key={row.rank}
                    className="flex justify-between border-b border-gray-100 py-1 dark:border-gray-800"
                  >
                    <span>
                      {row.rank}. {rowLabel(row)}
                    </span>
                    <span className="text-gray-500">{row.percentage}</span>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
