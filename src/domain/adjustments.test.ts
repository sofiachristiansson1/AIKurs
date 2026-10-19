import { describe, expect, it } from 'vitest';
import { collectAdjustments, sumSteps } from './adjustments';
import type { HorseProfile } from './types';

const adultWarmbloodOutdoor: HorseProfile = {
  clipped: false,
  breedType: 'warmblood',
  housing: 'outdoor',
  ageYears: 10,
};

describe('collectAdjustments', () => {
  it('returns nothing for an adult warmblood outdoors without precipitation', () => {
    expect(collectAdjustments(adultWarmbloodOutdoor, false)).toEqual([]);
  });

  it('adds one step for precipitation outdoors', () => {
    expect(collectAdjustments(adultWarmbloodOutdoor, true)).toEqual([
      { kind: 'precipitation', steps: 1 },
    ]);
  });

  it('ignores precipitation for a stabled horse and makes the blanket one step lighter', () => {
    const stabled: HorseProfile = { ...adultWarmbloodOutdoor, housing: 'stable' };
    expect(collectAdjustments(stabled, true)).toEqual([{ kind: 'stable', steps: -1 }]);
  });

  it.each([
    [2, [{ kind: 'youngHorse', steps: 1 }]],
    [3, []],
    [19, []],
    [20, [{ kind: 'seniorHorse', steps: 1 }]],
  ])('at %s years gives %j', (ageYears, expected) => {
    expect(collectAdjustments({ ...adultWarmbloodOutdoor, ageYears }, false)).toEqual(expected);
  });

  it.each([
    ['coldbloodOrPony', []],
    ['warmblood', []],
    ['thoroughbredOrArab', [{ kind: 'breed', steps: 1 }]],
  ] as const)('breed %s gives %j', (breedType, expected) => {
    expect(collectAdjustments({ ...adultWarmbloodOutdoor, breedType }, false)).toEqual(expected);
  });
});

describe('sumSteps', () => {
  it('returns zero for no adjustments', () => {
    expect(sumSteps([])).toEqual({
      requestedWarmingSteps: 0,
      appliedWarmingSteps: 0,
      totalSteps: 0,
    });
  });

  it('adds warming steps up to the cap of 2', () => {
    expect(
      sumSteps([
        { kind: 'precipitation', steps: 1 },
        { kind: 'seniorHorse', steps: 1 },
      ]).totalSteps,
    ).toBe(2);
  });

  it('caps three warming steps at 2', () => {
    expect(
      sumSteps([
        { kind: 'precipitation', steps: 1 },
        { kind: 'seniorHorse', steps: 1 },
        { kind: 'breed', steps: 1 },
      ]),
    ).toEqual({ requestedWarmingSteps: 3, appliedWarmingSteps: 2, totalSteps: 2 });
  });

  it('applies the stable step after the cap', () => {
    expect(
      sumSteps([
        { kind: 'youngHorse', steps: 1 },
        { kind: 'breed', steps: 1 },
        { kind: 'stable', steps: -1 },
      ]).totalSteps,
    ).toBe(1);
  });
});
