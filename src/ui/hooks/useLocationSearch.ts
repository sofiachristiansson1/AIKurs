import { useCallback, useEffect, useRef, useState } from 'react';
import { searchLocations } from '../../api/geocoding';
import type { ApiError } from '../../api/result';
import type { Location } from '../../domain/types';

export type LocationSearchState =
  | { readonly status: 'idle' }
  | { readonly status: 'searching'; readonly query: string }
  | { readonly status: 'choose'; readonly query: string; readonly matches: readonly Location[] }
  | { readonly status: 'error'; readonly query: string; readonly error: ApiError };

/**
 * Searches when asked to. A single match is selected straight away; several are offered as a
 * list. A new search cancels one that is still running.
 */
export function useLocationSearch(onSelect: (location: Location) => void) {
  const [state, setState] = useState<LocationSearchState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const search = useCallback(
    async (query: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ status: 'searching', query });
      const result = await searchLocations(query, { signal: controller.signal });
      if (controller.signal.aborted) {
        return;
      }
      if (!result.ok) {
        setState({ status: 'error', query, error: result.error });
      } else if (result.value.length === 1 && result.value[0] !== undefined) {
        setState({ status: 'idle' });
        onSelect(result.value[0]);
      } else {
        setState({ status: 'choose', query, matches: result.value });
      }
    },
    [onSelect],
  );

  const choose = useCallback(
    (location: Location) => {
      setState({ status: 'idle' });
      onSelect(location);
    },
    [onSelect],
  );

  return { state, search, choose };
}
