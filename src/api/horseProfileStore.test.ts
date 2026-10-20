import { describe, expect, it } from 'vitest';
import type { HorseProfile } from '../domain/types';
import { createHorseProfileStore, HORSE_PROFILE_KEY } from './horseProfileStore';
import { createBrokenStorage, createMemoryStorage } from './testHelpers';

const profile: HorseProfile = {
  clipped: true,
  breedType: 'warmblood',
  housing: 'outdoor',
  ageYears: 12,
};

function storeWith(stored: string) {
  return createHorseProfileStore(createMemoryStorage({ [HORSE_PROFILE_KEY]: stored }));
}

describe('horseProfileStore', () => {
  it('reads back what it saved', () => {
    const store = createHorseProfileStore(createMemoryStorage());
    expect(store.save(profile)).toEqual({ ok: true, value: undefined });
    expect(store.load()).toEqual({ ok: true, value: profile });
  });

  it('saves under a versioned key', () => {
    const storage = createMemoryStorage();
    createHorseProfileStore(storage).save(profile);
    expect([...storage.items.keys()]).toEqual(['tackesguiden.horseProfile.v1']);
  });

  it('returns null when nothing is stored', () => {
    expect(createHorseProfileStore(createMemoryStorage()).load()).toEqual({
      ok: true,
      value: null,
    });
  });

  it('returns null for invalid JSON', () => {
    expect(storeWith('{broken').load()).toEqual({ ok: true, value: null });
  });

  it.each([
    ['negative age', { ...profile, ageYears: -1 }],
    ['age that is not whole years', { ...profile, ageYears: 3.5 }],
    ['age above what the form allows', { ...profile, ageYears: 41 }],
    ['absurdly large age', { ...profile, ageYears: 1e308 }],
    ['unknown breed', { ...profile, breedType: 'unicorn' }],
    ['unknown housing', { ...profile, housing: 'barn' }],
    ['clipped as text', { ...profile, clipped: 'yes' }],
    ['missing age', { clipped: true, breedType: 'warmblood', housing: 'outdoor' }],
  ])('returns null for %s', (_description, stored) => {
    expect(storeWith(JSON.stringify(stored)).load()).toEqual({ ok: true, value: null });
  });

  it.each([0, 40])('accepts age %s', (ageYears) => {
    expect(storeWith(JSON.stringify({ ...profile, ageYears })).load()).toEqual({
      ok: true,
      value: { ...profile, ageYears },
    });
  });

  it('reports storageUnavailable when reading fails', () => {
    expect(createHorseProfileStore(createBrokenStorage()).load()).toEqual({
      ok: false,
      error: { kind: 'storageUnavailable' },
    });
  });

  it('reports storageUnavailable when saving fails', () => {
    expect(createHorseProfileStore(createBrokenStorage()).save(profile)).toEqual({
      ok: false,
      error: { kind: 'storageUnavailable' },
    });
  });
});
