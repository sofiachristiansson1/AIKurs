import { describe, expect, it } from 'vitest';
import { shiftLevel } from './shiftLevel';

describe('shiftLevel', () => {
  it('keeps the level for zero steps', () => {
    expect(shiftLevel('medium', 0)).toBe('medium');
  });

  it('moves up the scale', () => {
    expect(shiftLevel('none', 1)).toBe('rainSheet');
    expect(shiftLevel('heavy', 1)).toBe('heavyWithNeckCover');
    expect(shiftLevel('heavyWithNeckCover', 1)).toBe('heavyWithLiner');
  });

  it('moves down the scale', () => {
    expect(shiftLevel('light', -1)).toBe('rainSheet');
  });

  it('never goes below none', () => {
    expect(shiftLevel('none', -1)).toBe('none');
  });

  it('never goes above heavyWithLiner', () => {
    expect(shiftLevel('heavyWithNeckCover', 2)).toBe('heavyWithLiner');
  });
});
