import type { Location } from '../domain/types';
import { getJson, type RequestOptions } from './http';
import { err, ok, type ApiError, type Result } from './result';
import {
  asArray,
  asFiniteNumber,
  asLatitude,
  asLongitude,
  asPlaceText,
  isRecord,
} from './validation';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const MIN_QUERY_LENGTH = 2;
/** Longer than any Swedish place name, short enough to keep the request URL small. */
export const MAX_QUERY_LENGTH = 100;
const MAX_RESULTS = 10;
/** Searches are limited to Sweden for now. */
const COUNTRY_CODE = 'SE';

export async function searchLocations(
  query: string,
  options: RequestOptions = {},
): Promise<Result<Location[], ApiError>> {
  const name = query.trim();
  if (name.length < MIN_QUERY_LENGTH) {
    return err({ kind: 'emptyQuery' });
  }
  if (name.length > MAX_QUERY_LENGTH) {
    return err({ kind: 'queryTooLong' });
  }
  const response = await getJson(buildSearchUrl(name), options);
  return response.ok ? parseSearchResponse(response.value) : response;
}

export function buildSearchUrl(name: string): URL {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name,
    count: String(MAX_RESULTS),
    language: 'sv',
    countryCode: COUNTRY_CODE,
    format: 'json',
  }).toString();
  return url;
}

/** Open-Meteo leaves out "results" entirely when nothing matches. */
export function parseSearchResponse(body: unknown): Result<Location[], ApiError> {
  if (!isRecord(body)) {
    return err({ kind: 'invalidResponse' });
  }
  if (body.results === undefined) {
    return err({ kind: 'locationNotFound' });
  }
  const results = asArray(body.results);
  if (results === undefined) {
    return err({ kind: 'invalidResponse' });
  }
  const locations = results.map(toLocation).filter((location) => location !== undefined);
  if (locations.length > 0) {
    return ok(locations);
  }
  return err({ kind: results.length === 0 ? 'locationNotFound' : 'invalidResponse' });
}

/** Maps one geocoding result, or undefined if a required field is missing. */
export function toLocation(value: unknown): Location | undefined {
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
  const region = asPlaceText(value.admin1);
  return { id, name, country, latitude, longitude, ...(region === undefined ? {} : { region }) };
}
