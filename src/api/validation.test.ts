import { describe, expect, it } from 'vitest';
import {
  asArray,
  asBoolean,
  asFiniteNumber,
  asLatitude,
  asLocalDateTime,
  asLongitude,
  asNonEmptyString,
  asNumberInRange,
  asOneOf,
  asPlaceText,
  isRecord,
  parseJson,
} from './validation';

describe('isRecord', () => {
  it.each([
    [{}, true],
    [{ a: 1 }, true],
    [null, false],
    [[], false],
    ['text', false],
    [undefined, false],
  ])('%j gives %s', (value, expected) => {
    expect(isRecord(value)).toBe(expected);
  });
});

describe('asFiniteNumber', () => {
  it.each([
    [1.5, 1.5],
    [-3, -3],
    [0, 0],
    [Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, undefined],
    ['1', undefined],
    [null, undefined],
  ])('%s gives %s', (value, expected) => {
    expect(asFiniteNumber(value)).toBe(expected);
  });
});

describe('asNonEmptyString', () => {
  it('accepts text and rejects blank strings and non-strings', () => {
    expect(asNonEmptyString('Uppsala')).toBe('Uppsala');
    expect(asNonEmptyString('  ')).toBeUndefined();
    expect(asNonEmptyString(3)).toBeUndefined();
  });
});

describe('asPlaceText', () => {
  it('accepts names up to 200 characters', () => {
    expect(asPlaceText('Uppsala')).toBe('Uppsala');
    expect(asPlaceText('a'.repeat(200))).toBe('a'.repeat(200));
  });

  it('rejects blank, too long and non-string values', () => {
    expect(asPlaceText(' ')).toBeUndefined();
    expect(asPlaceText('a'.repeat(201))).toBeUndefined();
    expect(asPlaceText(3)).toBeUndefined();
  });
});

describe('asNumberInRange', () => {
  const range = { min: 0, max: 10 };

  it.each([
    [0, 0],
    [10, 10],
    [-0.1, undefined],
    [10.1, undefined],
    [Number.NaN, undefined],
    ['5', undefined],
  ])('%s gives %s', (value, expected) => {
    expect(asNumberInRange(value, range)).toBe(expected);
  });
});

describe('asLatitude and asLongitude', () => {
  it.each([
    [90, 90],
    [-90, -90],
    [90.1, undefined],
    [-90.1, undefined],
  ])('latitude %s gives %s', (value, expected) => {
    expect(asLatitude(value)).toBe(expected);
  });

  it.each([
    [180, 180],
    [-180, -180],
    [180.1, undefined],
    [-180.1, undefined],
  ])('longitude %s gives %s', (value, expected) => {
    expect(asLongitude(value)).toBe(expected);
  });
});

describe('asBoolean', () => {
  it('accepts only booleans', () => {
    expect(asBoolean(false)).toBe(false);
    expect(asBoolean('true')).toBeUndefined();
  });
});

describe('asArray', () => {
  it('accepts only arrays', () => {
    expect(asArray([1])).toEqual([1]);
    expect(asArray({ length: 1 })).toBeUndefined();
  });
});

describe('asOneOf', () => {
  it('accepts only listed values', () => {
    expect(asOneOf('stable', ['outdoor', 'stable'])).toBe('stable');
    expect(asOneOf('barn', ['outdoor', 'stable'])).toBeUndefined();
  });
});

describe('asLocalDateTime', () => {
  it.each([
    ['2026-10-19T14:00', '2026-10-19T14:00'],
    ['2026-10-19T14:00:00', undefined],
    ['2026-10-19T14:00Z', undefined],
    ['2026-10-19', undefined],
    ['2026-10-19T23:59', '2026-10-19T23:59'],
    ['2026-10-19T24:00', undefined],
    ['2026-10-19T99:00', undefined],
    ['2026-10-19T14:60', undefined],
    ['2026-13-19T14:00', undefined],
    ['2026-00-19T14:00', undefined],
    ['2026-10-32T14:00', undefined],
    ['2026-10-00T14:00', undefined],
    [42, undefined],
  ])('%j gives %j', (value, expected) => {
    expect(asLocalDateTime(value)).toBe(expected);
  });
});

describe('parseJson', () => {
  it('parses valid JSON and returns undefined for invalid text', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
    expect(parseJson('{not json')).toBeUndefined();
  });
});
