import { collectAdjustments, sumSteps } from './adjustments';
import { baseLevel } from './baseLevel';
import { hasSignificantPrecipitation, lowestEffectiveTemperature } from './periodWeather';
import { shiftLevel } from './shiftLevel';
import type { HorseProfile, Recommendation, WeatherPeriod } from './types';

/** Recommends a blanket for the given period, e.g. the current hour or the coming night. */
export function recommendBlanket(period: WeatherPeriod, horse: HorseProfile): Recommendation {
  const { lowestTemperatureC, temperatureBasis } = lowestEffectiveTemperature(
    period,
    horse.housing,
  );
  const base = baseLevel(lowestTemperatureC, horse.clipped);
  const adjustments = collectAdjustments(horse, hasSignificantPrecipitation(period));
  const steps = sumSteps(adjustments);
  return {
    level: shiftLevel(base, steps.totalSteps),
    baseLevel: base,
    requiresWaterproof: adjustments.some((adjustment) => adjustment.kind === 'precipitation'),
    lowestTemperatureC,
    temperatureBasis,
    adjustments,
    warmingCapApplied: steps.requestedWarmingSteps > steps.appliedWarmingSteps,
  };
}
