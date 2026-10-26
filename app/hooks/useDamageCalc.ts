import { useMemo } from "react";

import { calcDamage } from "~/lib/damage";
import type { DamageCalcInput, DamageCalcState } from "~/types/damage";

export function useDamageCalc(input: DamageCalcInput): DamageCalcState {
  return useMemo(() => calcDamage(input), [input]);
}
