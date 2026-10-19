import { ADJUSTMENT_RULES } from './blanketRules';
import { classifyAge } from './classifyAge';
import type { Adjustment, HorseProfile } from './types';

/** Returns the adjustments that apply to this horse, leaving out those with zero steps. */
export function collectAdjustments(
  horse: HorseProfile,
  hasSignificantPrecipitation: boolean,
): Adjustment[] {
  const isOutdoor = horse.housing === 'outdoor';
  const ageGroup = classifyAge(horse.ageYears);
  const candidates: Adjustment[] = [
    {
      kind: 'precipitation',
      steps: isOutdoor && hasSignificantPrecipitation ? ADJUSTMENT_RULES.precipitation.steps : 0,
    },
    { kind: 'youngHorse', steps: ageGroup === 'young' ? ADJUSTMENT_RULES.youngHorse.steps : 0 },
    { kind: 'seniorHorse', steps: ageGroup === 'senior' ? ADJUSTMENT_RULES.seniorHorse.steps : 0 },
    { kind: 'breed', steps: ADJUSTMENT_RULES.breedSteps[horse.breedType] },
    { kind: 'stable', steps: isOutdoor ? 0 : ADJUSTMENT_RULES.stable.steps },
  ];
  return candidates.filter((adjustment) => adjustment.steps !== 0);
}

export interface StepTotal {
  readonly requestedWarmingSteps: number;
  readonly appliedWarmingSteps: number;
  readonly totalSteps: number;
}

/** Adds up the steps. Warming steps are capped first, then lighter-blanket steps are applied. */
export function sumSteps(adjustments: readonly Adjustment[]): StepTotal {
  const requestedWarmingSteps = adjustments
    .filter((adjustment) => adjustment.steps > 0)
    .reduce((sum, adjustment) => sum + adjustment.steps, 0);
  const coolingSteps = adjustments
    .filter((adjustment) => adjustment.steps < 0)
    .reduce((sum, adjustment) => sum + adjustment.steps, 0);
  const appliedWarmingSteps = Math.min(requestedWarmingSteps, ADJUSTMENT_RULES.maxWarmingSteps);
  return {
    requestedWarmingSteps,
    appliedWarmingSteps,
    totalSteps: appliedWarmingSteps + coolingSteps,
  };
}
