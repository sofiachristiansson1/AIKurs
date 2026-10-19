import { describe, expect, it } from 'vitest';
import { classifyAge } from './classifyAge';

describe('classifyAge', () => {
  it.each([
    [0, 'young'],
    [2, 'young'],
    [2.9, 'young'],
    [3, 'adult'],
    [19, 'adult'],
    [19.9, 'adult'],
    [20, 'senior'],
    [30, 'senior'],
  ])('%s years is %s', (ageYears, expected) => {
    expect(classifyAge(ageYears)).toBe(expected);
  });
});
