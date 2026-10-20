// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LAST_LOCATION_KEY } from '../../api/lastLocationStore';
import type { Location } from '../../domain/types';
import { useLastLocation } from './useLastLocation';

const lund: Location = {
  id: 2693678,
  name: 'Lund',
  region: 'Skåne län',
  country: 'Sverige',
  latitude: 55.70584,
  longitude: 13.19321,
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('useLastLocation', () => {
  it('has no location on the first visit', () => {
    const { result } = renderHook(() => useLastLocation());
    expect(result.current.location).toBeUndefined();
  });

  it('remembers the selected location for the next visit', () => {
    const first = renderHook(() => useLastLocation());
    act(() => {
      first.result.current.selectLocation(lund);
    });
    expect(first.result.current.location).toEqual(lund);
    expect(localStorage.getItem(LAST_LOCATION_KEY)).not.toBeNull();

    const nextVisit = renderHook(() => useLastLocation());
    expect(nextVisit.result.current.location).toEqual(lund);
  });
});
