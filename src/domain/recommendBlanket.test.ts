import { describe, expect, it } from 'vitest';
import { recommendBlanket } from './recommendBlanket';
import { makeHour } from './testHelpers';
import type { HorseProfile, WeatherPeriod } from './types';

const adultWarmbloodOutdoor: HorseProfile = {
  clipped: false,
  breedType: 'warmblood',
  housing: 'outdoor',
  ageYears: 10,
};

function singleHour(overrides: Parameters<typeof makeHour>[1]): WeatherPeriod {
  return [makeHour('2026-10-19T22:00', overrides)];
}

describe('recommendBlanket', () => {
  it('gives no blanket and no adjustments on a mild dry night', () => {
    expect(
      recommendBlanket(singleHour({ apparentTemperatureC: 8 }), adultWarmbloodOutdoor),
    ).toEqual({
      level: 'none',
      baseLevel: 'none',
      requiresWaterproof: false,
      lowestTemperatureC: 8,
      temperatureBasis: 'apparent',
      adjustments: [],
      warmingCapApplied: false,
    });
  });

  it('uses the lowest apparent temperature of the period outdoors', () => {
    const period: WeatherPeriod = [
      makeHour('2026-10-19T22:00', { temperatureC: 6, apparentTemperatureC: 6 }),
      makeHour('2026-10-20T04:00', { temperatureC: 1, apparentTemperatureC: -2 }),
    ];
    const result = recommendBlanket(period, adultWarmbloodOutdoor);
    expect(result.lowestTemperatureC).toBe(-2);
    expect(result.level).toBe('medium');
  });

  it('gives a waterproof rain sheet to an unclipped horse in rain at 8 °C', () => {
    const result = recommendBlanket(
      singleHour({ apparentTemperatureC: 8, precipitationMm: 1.2 }),
      adultWarmbloodOutdoor,
    );
    expect(result.level).toBe('rainSheet');
    expect(result.requiresWaterproof).toBe(true);
  });

  it('caps warming at two steps for a senior thoroughbred in rain', () => {
    const horse: HorseProfile = {
      ...adultWarmbloodOutdoor,
      breedType: 'thoroughbredOrArab',
      ageYears: 22,
    };
    const result = recommendBlanket(
      singleHour({ apparentTemperatureC: 8, precipitationMm: 2 }),
      horse,
    );
    expect(result.baseLevel).toBe('none');
    expect(result.level).toBe('light');
    expect(result.warmingCapApplied).toBe(true);
  });

  it('uses air temperature, ignores rain and goes one step lighter in the stable', () => {
    const horse: HorseProfile = { ...adultWarmbloodOutdoor, clipped: true, housing: 'stable' };
    const result = recommendBlanket(
      singleHour({ temperatureC: 3, apparentTemperatureC: -5, precipitationMm: 3 }),
      horse,
    );
    expect(result.temperatureBasis).toBe('air');
    expect(result.baseLevel).toBe('medium');
    expect(result.level).toBe('light');
    expect(result.requiresWaterproof).toBe(false);
  });

  it('never goes above the warmest level', () => {
    const horse: HorseProfile = { ...adultWarmbloodOutdoor, clipped: true, ageYears: 1 };
    const result = recommendBlanket(singleHour({ apparentTemperatureC: -25 }), horse);
    expect(result.level).toBe('heavyWithLiner');
  });
});
