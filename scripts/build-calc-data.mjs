// @smogon/calc 의 챔피언스(gen 0) 데이터에서 화면에 필요한 값만 뽑아 작은 JSON으로 만든다.
// 목록·검색·메가 변환은 이 JSON을 쓰고, 무거운 @smogon/calc 는 실제 계산할 때만 불러온다.
//
// 사용법: npm run build:calc-data
// 출력:   data/champions.json
// 주의:   @smogon/calc 버전을 올리면 다시 실행한다.

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Generations } from "@smogon/calc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "data", "champions.json");

const gen = Generations.get(0);
const byName = (a, b) => a.name.localeCompare(b.name);

const data = {
  // 포켓몬: 이름과 기본 특성 (smogon 데이터에는 포켓몬마다 첫 특성만 있다)
  species: [...gen.species]
    .map((s) => ({ name: s.name, ability: s.abilities?.[0] ?? null }))
    .sort(byName),
  // 성격: 올라가는/내려가는 능력치
  natures: [...gen.natures]
    .map((n) => ({ name: n.name, plus: n.plus ?? null, minus: n.minus ?? null }))
    .sort(byName),
  // 도구: 메가스톤이면 { 원종: 메가 폼 }
  items: [...gen.items]
    .map((i) => (i.megaStone ? { name: i.name, megaStone: i.megaStone } : { name: i.name }))
    .sort(byName),
  abilities: [...gen.abilities].map((a) => a.name).sort(),
  // 공격 기술만 (변화기는 데미지가 없다)
  attackMoves: [...gen.moves]
    .filter((m) => m.category === "Physical" || m.category === "Special")
    .map((m) => m.name)
    .sort(),
};

await writeFile(OUT, JSON.stringify(data) + "\n");
console.log(
  `species ${data.species.length}, natures ${data.natures.length}, items ${data.items.length}, abilities ${data.abilities.length}, attackMoves ${data.attackMoves.length}`,
);
