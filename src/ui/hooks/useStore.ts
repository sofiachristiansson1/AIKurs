import { useState } from 'react';
import type { ApiError } from '../../api/result';
import { getBrowserStorage, type JsonStore, type KeyValueStorage } from '../../api/webStorage';

export interface StoreAccess<T> {
  readonly store: JsonStore<T> | undefined;
  readonly initialValue: T | null;
  readonly initialError: ApiError | undefined;
}

/** Opens a store on the browser's storage once and reads its initial value. */
export function useStore<T>(
  createStore: (storage: KeyValueStorage) => JsonStore<T>,
): StoreAccess<T> {
  const [access] = useState(() => openStore(createStore));
  return access;
}

function openStore<T>(createStore: (storage: KeyValueStorage) => JsonStore<T>): StoreAccess<T> {
  const storage = getBrowserStorage();
  if (!storage.ok) {
    return { store: undefined, initialValue: null, initialError: storage.error };
  }
  const store = createStore(storage.value);
  const loaded = store.load();
  return loaded.ok
    ? { store, initialValue: loaded.value, initialError: undefined }
    : { store, initialValue: null, initialError: loaded.error };
}
