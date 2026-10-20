// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HORSE_PROFILE_KEY } from '../../api/horseProfileStore';
import { DEFAULT_HORSE_DRAFT, useHorseProfile } from './useHorseProfile';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useHorseProfile', () => {
  it('starts with an unclipped warmblood outdoors and no age', () => {
    const { result } = renderHook(() => useHorseProfile());
    expect(result.current.draft).toEqual({
      clipped: false,
      breedType: 'warmblood',
      housing: 'outdoor',
      ageYears: undefined,
    });
    expect(result.current.profile).toBeUndefined();
  });

  it('saves the profile once the age is filled in', () => {
    const { result } = renderHook(() => useHorseProfile());
    act(() => {
      result.current.updateDraft({ ...DEFAULT_HORSE_DRAFT, ageYears: 12 });
    });
    expect(result.current.profile?.ageYears).toBe(12);
    expect(JSON.parse(localStorage.getItem(HORSE_PROFILE_KEY) ?? 'null')).toEqual({
      clipped: false,
      breedType: 'warmblood',
      housing: 'outdoor',
      ageYears: 12,
    });
  });

  it('does not save an incomplete draft', () => {
    const { result } = renderHook(() => useHorseProfile());
    act(() => {
      result.current.updateDraft({ ...DEFAULT_HORSE_DRAFT, clipped: true });
    });
    expect(localStorage.getItem(HORSE_PROFILE_KEY)).toBeNull();
  });

  it('loads a stored profile', () => {
    localStorage.setItem(
      HORSE_PROFILE_KEY,
      JSON.stringify({
        clipped: true,
        breedType: 'coldbloodOrPony',
        housing: 'stable',
        ageYears: 22,
      }),
    );
    const { result } = renderHook(() => useHorseProfile());
    expect(result.current.profile).toEqual({
      clipped: true,
      breedType: 'coldbloodOrPony',
      housing: 'stable',
      ageYears: 22,
    });
  });

  it('reports when the browser refuses to save', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const { result } = renderHook(() => useHorseProfile());
    act(() => {
      result.current.updateDraft({ ...DEFAULT_HORSE_DRAFT, ageYears: 5 });
    });
    expect(result.current.storageError).toEqual({ kind: 'storageUnavailable' });
    expect(result.current.profile?.ageYears).toBe(5);
  });
});
