/** Helpers that turn untrusted `unknown` data into typed values, or undefined when it does not fit. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/** Longest name, region or country we accept. Real place names are far shorter. */
export const MAX_PLACE_TEXT_LENGTH = 200;

/** A non-empty place name, region or country of a sensible length. */
export function asPlaceText(value: unknown): string | undefined {
  const text = asNonEmptyString(value);
  return text !== undefined && text.length <= MAX_PLACE_TEXT_LENGTH ? text : undefined;
}

export interface NumberRange {
  readonly min: number;
  readonly max: number;
}

/** A finite number from min to max, both included. */
export function asNumberInRange(value: unknown, range: NumberRange): number | undefined {
  const number = asFiniteNumber(value);
  return number !== undefined && number >= range.min && number <= range.max ? number : undefined;
}

export const LATITUDE_RANGE: NumberRange = { min: -90, max: 90 };
export const LONGITUDE_RANGE: NumberRange = { min: -180, max: 180 };

export function asLatitude(value: unknown): number | undefined {
  return asNumberInRange(value, LATITUDE_RANGE);
}

export function asLongitude(value: unknown): number | undefined {
  return asNumberInRange(value, LONGITUDE_RANGE);
}

export function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function asArray(value: unknown): readonly unknown[] | undefined {
  return Array.isArray(value) ? (value as unknown[]) : undefined;
}

export function asOneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.find((candidate) => candidate === value);
}

/** 'YYYY-MM-DDTHH:mm' with month 01–12, day 01–31, hour 00–23 and minute 00–59. */
const LOCAL_DATE_TIME_PATTERN =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d$/;

/** Accepts only 'YYYY-MM-DDTHH:mm', the format the domain layer relies on. */
export function asLocalDateTime(value: unknown): string | undefined {
  return typeof value === 'string' && LOCAL_DATE_TIME_PATTERN.test(value) ? value : undefined;
}

/** Parses JSON without throwing; returns undefined for invalid text. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}
