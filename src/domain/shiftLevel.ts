import { BLANKET_LEVELS, type BlanketLevel } from './types';

/** Moves along the blanket scale, stopping at the lightest and warmest levels. */
export function shiftLevel(level: BlanketLevel, steps: number): BlanketLevel {
  const lastIndex = BLANKET_LEVELS.length - 1;
  const index = Math.min(Math.max(BLANKET_LEVELS.indexOf(level) + steps, 0), lastIndex);
  const shifted = BLANKET_LEVELS[index];
  if (shifted === undefined) {
    throw new Error(`Blanket level index ${index} is outside the scale`);
  }
  return shifted;
}
