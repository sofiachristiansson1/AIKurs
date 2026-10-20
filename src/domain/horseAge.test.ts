import { describe, expect, it } from 'vitest';
import { isValidAge } from './horseAge';

describe('isValidAge', () => {
  it.each([
    [undefined, false],
    [-1, false],
    [0, true],
    [40, true],
    [41, false],
    [3.5, false],
  ])('%s gives %s', (ageYears, expected) => {
    expect(isValidAge(ageYears)).toBe(expected);
  });
});
