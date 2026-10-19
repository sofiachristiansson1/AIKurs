import { describe, expect, it } from 'vitest';
import {
  asArray,
  asBoolean,
  asFiniteNumber,
  asLocalDateTime,
  asNonEmptyString,
  asOneOf,
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
