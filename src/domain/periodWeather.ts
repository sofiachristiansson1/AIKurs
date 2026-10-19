import { ADJUSTMENT_RULES } from './blanketRules';
import type { Housing, TemperatureBasis, WeatherPeriod } from './types';

export interface LowestTemperature {
  readonly lowestTemperatureC: number;
  readonly temperatureBasis: TemperatureBasis;
}

/**
 * Outdoors the apparent temperature is used, so wind is included.
 * In the stable the horse is sheltered, so the air temperature is used.
 */
export function lowestEffectiveTemperature(
  period: WeatherPeriod,
  housing: Housing,
): LowestTemperature {
  const temperatureBasis: TemperatureBasis = housing === 'outdoor' ? 'apparent' : 'air';
  const temperaturesC = period.map((hour) =>
    temperatureBasis === 'apparent' ? hour.apparentTemperatureC : hour.temperatureC,
  );
  return { lowestTemperatureC: Math.min(...temperaturesC), temperatureBasis };
}

export function hasSignificantPrecipitation(period: WeatherPeriod): boolean {
  return period.some((hour) => hour.precipitationMm >= ADJUSTMENT_RULES.precipitation.minMmPerHour);
}
