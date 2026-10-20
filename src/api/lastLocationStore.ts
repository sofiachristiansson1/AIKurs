import type { Location } from '../domain/types';
import { asFiniteNumber, asLatitude, asLongitude, asPlaceText, isRecord } from './validation';
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
  const name = asPlaceText(value.name);
  const country = asPlaceText(value.country);
  const latitude = asLatitude(value.latitude);
  const longitude = asLongitude(value.longitude);
  if (
    id === undefined ||
    name === undefined ||
    country === undefined ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return undefined;
  }
  const region = asPlaceText(value.region);
  return { id, name, country, latitude, longitude, ...(region === undefined ? {} : { region }) };
}
