import type { BlanketLevel, BreedType } from './types';

/*
 * All blanket thresholds and adjustments live in this file. Change a value here, nowhere else.
 *
 * Sources (combined; where they disagree the warmer option is chosen, at most one level warmer):
 * [UKY]     University of Kentucky, ASC240 "Blanketing horses":
 *           https://publications.mgcafe.uky.edu/files/ASC240.pdf
 * [UMAINE]  UMaine Extension, blanketing guidelines:
 *           https://extension.umaine.edu/publications/wp-json/wp/v2/pages/32170
 * [RUTGERS] Rutgers Equine Science Center, "To blanket or not to blanket":
 *           https://esc.rutgers.edu/fact_sheet/to-blanket-or-not-to-blanket/
 * [STACK]   SmartPak, "What blanket weight for what temperature" and "Blanketing when raining":
 *           https://www.sstack.com/blogs/learning-center/what-blanket-weight-for-what-temperature
 *           https://www.sstack.com/blogs/blanketing/how-to-keep-your-horse-dry
 * [MEJDELL] Mejdell et al., "The effect of weather conditions on the preference in horses for
 *           wearing blankets", NMBU: https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2620787
 * [OWNER]   Decided by the project owner where the sources give no number.
 */

export interface BaseRule {
  /** The rule applies when the lowest temperature is strictly above this value (°C). */
  readonly aboveC: number;
  readonly unclipped: BlanketLevel;
  readonly clipped: BlanketLevel;
}

/**
 * Base level from the lowest temperature in the period, warmest row first.
 * A temperature exactly on a boundary falls into the colder row, giving the warmer blanket [OWNER].
 */
export const BASE_RULES: readonly BaseRule[] = [
  { aboveC: 15, unclipped: 'none', clipped: 'none' }, // [STACK]
  { aboveC: 10, unclipped: 'none', clipped: 'rainSheet' }, // [STACK]
  { aboveC: 5, unclipped: 'none', clipped: 'light' }, // [UMAINE] [STACK] [UKY] LCT ≈ 5 °C
  { aboveC: -1, unclipped: 'light', clipped: 'medium' }, // [STACK] [UMAINE]
  { aboveC: -9, unclipped: 'medium', clipped: 'heavy' }, // [UMAINE] [STACK]
  { aboveC: -18, unclipped: 'heavy', clipped: 'heavyWithNeckCover' }, // [UMAINE] [STACK] [MEJDELL]; neck cover/liner split [OWNER]
];

/** Applies when the lowest temperature is at or below the last BASE_RULES boundary. */
export const COLDEST_RULE: Omit<BaseRule, 'aboveC'> = {
  unclipped: 'heavyWithLiner',
  clipped: 'heavyWithLiner',
}; // [UMAINE]

export const ADJUSTMENT_RULES = {
  /** Rain or wet snow: one step warmer and the blanket must be waterproof. Outdoor horses only. */
  precipitation: { minMmPerHour: 0.5, steps: 1 }, // [STACK] [RUTGERS] [UKY]; threshold [OWNER]
  /** Young horses need more warmth. */
  youngHorse: { underAgeYears: 3, steps: 1 }, // [STACK] [UMAINE]; age limit [OWNER]
  /** Senior horses need more warmth. */
  seniorHorse: { fromAgeYears: 20, steps: 1 }, // [STACK] [UMAINE] [UKY]; age limit [OWNER]
  /** Lighter, thin-skinned breeds are more cold-sensitive. */
  breedSteps: {
    coldbloodOrPony: 0,
    warmblood: 0,
    thoroughbredOrArab: 1,
  } satisfies Record<BreedType, number>, // [UKY]
  /** A stabled horse is sheltered from wind and rain. */
  stable: { steps: -1 }, // [UMAINE] [RUTGERS]; step size [OWNER]
  /** Warming adjustments together never add more than this many steps. */
  maxWarmingSteps: 2, // [OWNER]
} as const;

/** Night window for the "upcoming night" recommendation, 22:00–06:00 inclusive [OWNER]. */
export const NIGHT_WINDOW = { startHour: 22, endHour: 6 } as const;
