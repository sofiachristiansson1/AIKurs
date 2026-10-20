import { describe, expect, it } from 'vitest';
import { recommendForForecast } from './recommendForForecast';
import { makeHour } from './testHelpers';
import type { Forecast, HorseProfile } from './types';

const horse: HorseProfile = {
  clipped: false,
  breedType: 'warmblood',
  housing: 'outdoor',
  ageYears: 10,
};

const current = {
  localTime: '2026-10-19T14:20',
  temperatureC: 9,
  apparentTemperatureC: 8,
  windSpeedMs: 3,
};

describe('recommendForForecast', () => {
  it('recommends for the current hour and the coming night', () => {
    const forecast: Forecast = {
      nowLocal: '2026-10-19T14:20',
      current,
      hours: [
        makeHour('2026-10-19T14:00', { apparentTemperatureC: 8 }),
        makeHour('2026-10-19T22:00', { apparentTemperatureC: 1 }),
        makeHour('2026-10-20T04:00', { apparentTemperatureC: -2 }),
      ],
    };
    const result = recommendForForecast(forecast, horse);
    expect(result.now?.level).toBe('none');
    expect(result.now?.lowestTemperatureC).toBe(8);
    expect(result.night?.level).toBe('medium');
    expect(result.night?.lowestTemperatureC).toBe(-2);
  });

  it('leaves out periods the forecast does not cover', () => {
    const forecast: Forecast = {
      nowLocal: '2026-10-19T14:20',
      current,
      hours: [makeHour('2026-10-19T15:00')],
    };
    expect(recommendForForecast(forecast, horse)).toEqual({ now: undefined, night: undefined });
  });
});
