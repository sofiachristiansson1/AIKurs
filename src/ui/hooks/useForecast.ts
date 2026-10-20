import { useCallback, useEffect, useState } from 'react';
import { fetchForecast } from '../../api/forecast';
import { catchUnexpected, type ApiError, type Result } from '../../api/result';
import type { Forecast, Location } from '../../domain/types';

export type ForecastState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly forecast: Forecast }
  | { readonly status: 'error'; readonly error: ApiError };

interface Loaded {
  readonly key: string;
  readonly result: Result<Forecast, ApiError>;
}

/** Fetches the forecast whenever the location changes or the user retries. */
export function useForecast(location: Location | undefined) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | undefined>(undefined);
  const key = location === undefined ? undefined : `${location.id}:${attempt}`;

  useEffect(() => {
    if (location === undefined || key === undefined) {
      return;
    }
    const controller = new AbortController();
    const request = catchUnexpected(fetchForecast(location, { signal: controller.signal }));
    // Never rejects: catchUnexpected turns every failure into a result.
    void request.then((result) => {
      if (!controller.signal.aborted) {
        setLoaded({ key, result });
      }
    });
    return () => {
      controller.abort();
    };
  }, [location, key]);

  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  return { state: toState(key, loaded), retry };
}

function toState(key: string | undefined, loaded: Loaded | undefined): ForecastState {
  if (key === undefined) {
    return { status: 'idle' };
  }
  if (loaded?.key !== key) {
    return { status: 'loading' };
  }
  return loaded.result.ok
    ? { status: 'ready', forecast: loaded.result.value }
    : { status: 'error', error: loaded.result.error };
}
