import { BASE_RULES, COLDEST_RULE } from './blanketRules';
import type { BlanketLevel } from './types';

/** Looks up the blanket level for the lowest temperature, before any adjustments. */
export function baseLevel(lowestTemperatureC: number, clipped: boolean): BlanketLevel {
  const rule =
    BASE_RULES.find((candidate) => lowestTemperatureC > candidate.aboveC) ?? COLDEST_RULE;
  return clipped ? rule.clipped : rule.unclipped;
}
