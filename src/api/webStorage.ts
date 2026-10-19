import { err, ok, type ApiError, type Result } from './result';
import { parseJson } from './validation';

/** The part of the Web Storage API the stores use. Tests pass an in-memory version. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface JsonStore<T> {
  /** The stored value, null when nothing valid is stored, or storageUnavailable. */
  load(): Result<T | null, ApiError>;
  save(value: T): Result<void, ApiError>;
}

/** Returns the browser's localStorage, which can throw when the user has blocked site data. */
export function getBrowserStorage(): Result<KeyValueStorage, ApiError> {
  try {
    return ok(window.localStorage);
  } catch {
    return err({ kind: 'storageUnavailable' });
  }
}

export function createJsonStore<T>(
  storage: KeyValueStorage,
  key: string,
  parse: (value: unknown) => T | undefined,
): JsonStore<T> {
  return {
    load: () => loadJson(storage, key, parse),
    save: (value) => saveJson(storage, key, value),
  };
}

function loadJson<T>(
  storage: KeyValueStorage,
  key: string,
  parse: (value: unknown) => T | undefined,
): Result<T | null, ApiError> {
  let text: string | null;
  try {
    text = storage.getItem(key);
  } catch {
    return err({ kind: 'storageUnavailable' });
  }
  // Data that is missing, corrupt or in an old format counts as "nothing stored".
  return ok(text === null ? null : (parse(parseJson(text)) ?? null));
}

function saveJson<T>(storage: KeyValueStorage, key: string, value: T): Result<void, ApiError> {
  try {
    storage.setItem(key, JSON.stringify(value));
    return ok(undefined);
  } catch {
    return err({ kind: 'storageUnavailable' });
  }
}
