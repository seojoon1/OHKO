import { Generations, toID } from "@smogon/calc";

const gen = Generations.get(0);

// 메가스톤을 들면 메가 폼으로 바꾼다 (Garchomp + Garchompite Z → Garchomp-Mega-Z).
// 메가 폼은 특성이 하나로 정해져 있어 특성도 같이 바꾼다.
export function toMega(species: string, item?: string, ability?: string) {
  const mega = item
    ? gen.items.get(toID(item) as never)?.megaStone?.[species as never]
    : undefined;
  if (!mega) return { name: species, ability };
  return {
    name: mega as string,
    ability: gen.species.get(toID(mega) as never)?.abilities?.[0] ?? ability,
  };
}
