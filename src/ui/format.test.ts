import { describe, expect, it } from 'vitest';
import {
  formatClockTime,
  formatLocation,
  formatPrecipitation,
  formatSteps,
  formatTemperature,
  formatWindSpeed,
} from './format';

describe('format', () => {
  it('writes numbers the Swedish way with one decimal at most', () => {
    expect(formatTemperature(-2.44)).toBe('−2,4 °C');
    expect(formatTemperature(3)).toBe('3 °C');
    expect(formatWindSpeed(4.5)).toBe('4,5 m/s');
    expect(formatPrecipitation(0.6)).toBe('0,6 mm');
  });

  it('shows steps with sign', () => {
    expect(formatSteps(1)).toBe('+1 steg');
    expect(formatSteps(-1)).toBe('−1 steg');
  });

  it('shows the clock time', () => {
    expect(formatClockTime('2026-10-19T22:15')).toBe('kl. 22:15');
  });
});

describe('formatLocation', () => {
  it('adds the county when known', () => {
    expect(formatLocation({ name: 'Uppsala', region: 'Örebro län' })).toBe('Uppsala, Örebro län');
    expect(formatLocation({ name: 'Visby' })).toBe('Visby');
  });
});
