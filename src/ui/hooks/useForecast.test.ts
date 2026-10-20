// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeForecastResponse } from '../../api/fixtures/forecast';
import { jsonResponse, stubFetch, stubFetchJson } from '../../api/testHelpers';
import type { Location } from '../../domain/types';
import { useForecast } from './useForecast';

const uppsala: Location = {
  id: 2666199,
  name: 'Uppsala',
  country: 'Sverige',
  latitude: 59.85882,
  longitude: 17.63889,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useForecast', () => {
  it('is idle without a location', () => {
    const fetchMock = stubFetchJson(makeForecastResponse());
    const { result } = renderHook(() => useForecast(undefined));
    expect(result.current.state.status).toBe('idle');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads the forecast for the location', async () => {
    stubFetchJson(makeForecastResponse());
    const { result } = renderHook(() => useForecast(uppsala));
    expect(result.current.state.status).toBe('loading');
    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
  });

  it('shows an error and can retry', async () => {
    const fetchMock = stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    const { result } = renderHook(() => useForecast(uppsala));
    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: 'error',
        error: { kind: 'network', timedOut: false },
      });
    });
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(makeForecastResponse())));
    act(() => {
      result.current.retry();
    });
    expect(result.current.state.status).toBe('loading');
    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
  });
});
