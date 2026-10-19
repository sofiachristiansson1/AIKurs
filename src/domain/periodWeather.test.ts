import { describe, expect, it } from 'vitest';
import { hasSignificantPrecipitation, lowestEffectiveTemperature } from './periodWeather';
import { makeHour } from './testHelpers';
import type { WeatherPeriod } from './types';

const period: WeatherPeriod = [
  makeHour('2026-10-19T22:00', { temperatureC: 4, apparentTemperatureC: 1 }),
  makeHour('2026-10-19T23:00', { temperatureC: 2, apparentTemperatureC: -3 }),
  makeHour('2026-10-20T00:00', { temperatureC: 3, apparentTemperatureC: -1 }),
];

describe('lowestEffectiveTemperature', () => {
  it('uses the lowest apparent temperature outdoors', () => {
    expect(lowestEffectiveTemperature(period, 'outdoor')).toEqual({
      lowestTemperatureC: -3,
      temperatureBasis: 'apparent',
    });
  });

  it('uses the lowest air temperature in the stable', () => {
    expect(lowestEffectiveTemperature(period, 'stable')).toEqual({
      lowestTemperatureC: 2,
      temperatureBasis: 'air',
    });
  });
});

describe('hasSignificantPrecipitation', () => {
  it.each([
    [0, false],
    [0.4, false],
    [0.5, true],
    [0.6, true],
  ])('%s mm in one hour gives %s', (precipitationMm, expected) => {
    const withPrecipitation: WeatherPeriod = [
      makeHour('2026-10-19T22:00'),
      makeHour('2026-10-19T23:00', { precipitationMm }),
    ];
    expect(hasSignificantPrecipitation(withPrecipitation)).toBe(expected);
  });
});
