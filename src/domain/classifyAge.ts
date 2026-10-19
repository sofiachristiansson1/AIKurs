import { ADJUSTMENT_RULES } from './blanketRules';
import type { AgeGroup } from './types';

export function classifyAge(ageYears: number): AgeGroup {
  if (ageYears < ADJUSTMENT_RULES.youngHorse.underAgeYears) {
    return 'young';
  }
  if (ageYears >= ADJUSTMENT_RULES.seniorHorse.fromAgeYears) {
    return 'senior';
  }
  return 'adult';
}
