import { useCallback, useState } from 'react';
import { createLastLocationStore } from '../../api/lastLocationStore';
import type { ApiError } from '../../api/result';
import type { Location } from '../../domain/types';
import { useStore } from './useStore';

export interface LastLocationState {
  readonly location: Location | undefined;
  readonly storageError: ApiError | undefined;
  readonly selectLocation: (location: Location) => void;
}

/** The chosen place, remembered between visits. */
export function useLastLocation(): LastLocationState {
  const { store, initialValue, initialError } = useStore(createLastLocationStore);
  const [location, setLocation] = useState<Location | undefined>(initialValue ?? undefined);
  const [storageError, setStorageError] = useState(initialError);

  const selectLocation = useCallback(
    (next: Location) => {
      setLocation(next);
      if (store !== undefined) {
        const saved = store.save(next);
        setStorageError(saved.ok ? undefined : saved.error);
      }
    },
    [store],
  );

  return { location, storageError, selectLocation };
}
