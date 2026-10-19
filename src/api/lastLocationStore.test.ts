import { describe, expect, it } from 'vitest';
import type { Location } from '../domain/types';
import { createLastLocationStore, LAST_LOCATION_KEY } from './lastLocationStore';
import { createBrokenStorage, createMemoryStorage } from './testHelpers';

const uppsala: Location = {
  id: 2666199,
  name: 'Uppsala',
  region: 'Uppsala län',
  country: 'Sverige',
  latitude: 59.85882,
  longitude: 17.63889,
};

function storeWith(stored: string) {
  return createLastLocationStore(createMemoryStorage({ [LAST_LOCATION_KEY]: stored }));
}

describe('lastLocationStore', () => {
  it('reads back what it saved', () => {
    const store = createLastLocationStore(createMemoryStorage());
    expect(store.save(uppsala)).toEqual({ ok: true, value: undefined });
    expect(store.load()).toEqual({ ok: true, value: uppsala });
  });

  it('saves under a versioned key', () => {
    const storage = createMemoryStorage();
    createLastLocationStore(storage).save(uppsala);
    expect([...storage.items.keys()]).toEqual(['tackesguiden.lastLocation.v1']);
  });

  it('keeps a location without region', () => {
    const visby: Location = {
      id: 2662689,
      name: 'Visby',
      country: 'Sverige',
      latitude: 57.64,
      longitude: 18.3,
    };
    expect(storeWith(JSON.stringify(visby)).load()).toEqual({ ok: true, value: visby });
  });

  it('returns null when nothing is stored', () => {
    expect(createLastLocationStore(createMemoryStorage()).load()).toEqual({
      ok: true,
      value: null,
    });
  });

  it('returns null for invalid JSON', () => {
    expect(storeWith('not json').load()).toEqual({ ok: true, value: null });
  });

  it.each([
    ['missing name', { ...uppsala, name: undefined }],
    ['latitude as text', { ...uppsala, latitude: '59.8' }],
    ['latitude out of range', { ...uppsala, latitude: 91 }],
    ['longitude out of range', { ...uppsala, longitude: -181 }],
  ])('returns null for %s', (_description, stored) => {
    expect(storeWith(JSON.stringify(stored)).load()).toEqual({ ok: true, value: null });
  });

  it('reports storageUnavailable when reading or saving fails', () => {
    const store = createLastLocationStore(createBrokenStorage());
    expect(store.load()).toEqual({ ok: false, error: { kind: 'storageUnavailable' } });
    expect(store.save(uppsala)).toEqual({ ok: false, error: { kind: 'storageUnavailable' } });
  });
});
