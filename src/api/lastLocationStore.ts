import type { Location } from '../domain/types';
import { asFiniteNumber, asNonEmptyString, isRecord } from './validation';
import { createJsonStore, type JsonStore, type KeyValueStorage } from './webStorage';

/** Bump the version if the stored shape changes; old data is then ignored. */
export const LAST_LOCATION_KEY = 'tackesguiden.lastLocation.v1';

export function createLastLocationStore(storage: KeyValueStorage): JsonStore<Location> {
  return createJsonStore(storage, LAST_LOCATION_KEY, parseStoredLocation);
}

export function parseStoredLocation(value: unknown): Location | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = asFiniteNumber(value.id);
  const name = asNonEmptyString(value.name);
  const country = asNonEmptyString(value.country);
  const latitude = asFiniteNumber(value.latitude);
  const longitude = asFiniteNumber(value.longitude);
  if (
    id === undefined ||
    name === undefined ||
    country === undefined ||
    latitude === undefined ||
    longitude === undefined ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return undefined;
  }
  const region = asNonEmptyString(value.region);
  return { id, name, country, latitude, longitude, ...(region === undefined ? {} : { region }) };
}
