import { BREED_TYPES, HOUSINGS, type HorseProfile } from '../domain/types';
import { asBoolean, asFiniteNumber, asOneOf, isRecord } from './validation';
import { createJsonStore, type JsonStore, type KeyValueStorage } from './webStorage';

/** Bump the version if the stored shape changes; old data is then ignored. */
export const HORSE_PROFILE_KEY = 'tackesguiden.horseProfile.v1';

export function createHorseProfileStore(storage: KeyValueStorage): JsonStore<HorseProfile> {
  return createJsonStore(storage, HORSE_PROFILE_KEY, parseHorseProfile);
}

export function parseHorseProfile(value: unknown): HorseProfile | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const clipped = asBoolean(value.clipped);
  const breedType = asOneOf(value.breedType, BREED_TYPES);
  const housing = asOneOf(value.housing, HOUSINGS);
  const ageYears = asFiniteNumber(value.ageYears);
  if (
    clipped === undefined ||
    breedType === undefined ||
    housing === undefined ||
    ageYears === undefined ||
    ageYears < 0
  ) {
    return undefined;
  }
  return { clipped, breedType, housing, ageYears };
}
