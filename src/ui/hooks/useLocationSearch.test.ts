// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { uppsalaSearchResponse } from '../../api/fixtures/geocoding';
import { searchLocations } from '../../api/geocoding';
import { jsonResponse, stubFetch, stubFetchJson } from '../../api/testHelpers';
import { useLocationSearch } from './useLocationSearch';

vi.mock('../../api/geocoding', { spy: true });

const lundResponse = {
  results: [{ id: 2, name: 'Lund', country: 'Sverige', latitude: 55.7, longitude: 13.19 }],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useLocationSearch', () => {
  it('selects a single match straight away', async () => {
    stubFetchJson(lundResponse);
    const onSelect = vi.fn();
    const { result } = renderHook(() => useLocationSearch(onSelect));
    await act(() => result.current.search('Lund'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Lund' }));
    expect(result.current.state.status).toBe('idle');
  });

  it('offers several matches to choose from', async () => {
    stubFetchJson(uppsalaSearchResponse);
    const onSelect = vi.fn();
    const { result } = renderHook(() => useLocationSearch(onSelect));
    await act(() => result.current.search('Uppsala'));
    const { state } = result.current;
    expect(state.status === 'choose' && state.matches.length).toBe(2);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('reports errors with the query', async () => {
    stubFetchJson({ generationtime_ms: 0.1 });
    const { result } = renderHook(() => useLocationSearch(vi.fn()));
    await act(() => result.current.search('Xqzzy'));
    expect(result.current.state).toEqual({
      status: 'error',
      query: 'Xqzzy',
      error: { kind: 'locationNotFound' },
    });
  });

  it('shows an error instead of searching forever when the search throws unexpectedly', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(searchLocations).mockRejectedValueOnce(new Error('bug in parsing'));
    const { result } = renderHook(() => useLocationSearch(vi.fn()));
    await act(() => result.current.search('Lund'));
    expect(result.current.state).toEqual({
      status: 'error',
      query: 'Lund',
      error: { kind: 'unexpected' },
    });
  });

  it('ignores an older search that is replaced by a newer one', async () => {
    let answerFirst: (response: Response) => void = () => undefined;
    stubFetch((url) =>
      url.searchParams.get('name') === 'Uppsala'
        ? new Promise<Response>((resolve, reject) => {
            answerFirst = resolve;
            void reject;
          })
        : Promise.resolve(jsonResponse(lundResponse)),
    );
    const onSelect = vi.fn();
    const { result } = renderHook(() => useLocationSearch(onSelect));
    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.search('Uppsala');
    });
    await act(() => result.current.search('Lund'));
    answerFirst(jsonResponse(uppsalaSearchResponse));
    await act(() => first);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(result.current.state.status).toBe('idle');
  });
});
