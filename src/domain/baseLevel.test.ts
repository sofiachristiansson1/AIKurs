import { describe, expect, it } from 'vitest';
import { baseLevel } from './baseLevel';

// Thresholds are written out on purpose: changing a rule should make these tests fail.
describe('baseLevel', () => {
  describe('unclipped horse', () => {
    it.each([
      [25, 'none'],
      [15.1, 'none'],
      [15, 'none'],
      [10.1, 'none'],
      [10, 'none'],
      [5.1, 'none'],
      [5, 'light'],
      [-0.9, 'light'],
      [-1, 'medium'],
      [-8.9, 'medium'],
      [-9, 'heavy'],
      [-17.9, 'heavy'],
      [-18, 'heavyWithLiner'],
      [-30, 'heavyWithLiner'],
    ])('%s °C gives %s', (temperatureC, expected) => {
      expect(baseLevel(temperatureC, false)).toBe(expected);
    });
  });

  describe('clipped horse', () => {
    it.each([
      [25, 'none'],
      [15.1, 'none'],
      [15, 'rainSheet'],
      [10.1, 'rainSheet'],
      [10, 'light'],
      [5.1, 'light'],
      [5, 'medium'],
      [-0.9, 'medium'],
      [-1, 'heavy'],
      [-8.9, 'heavy'],
      [-9, 'heavyWithNeckCover'],
      [-17.9, 'heavyWithNeckCover'],
      [-18, 'heavyWithLiner'],
      [-30, 'heavyWithLiner'],
    ])('%s °C gives %s', (temperatureC, expected) => {
      expect(baseLevel(temperatureC, true)).toBe(expected);
    });
  });
});
