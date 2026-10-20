import { describe, expect, it } from 'vitest';
import type { ApiError } from '../api/result';
import { BLANKET_LEVELS } from '../domain/types';
import { blanketLabel, errorMessage } from './texts';

describe('blanketLabel', () => {
  it.each(BLANKET_LEVELS)('has a label for %s', (level) => {
    expect(blanketLabel(level, 'outdoor')).not.toBe('');
  });

  it('calls the 0 g level a rain sheet outdoors and a stable sheet indoors', () => {
    expect(blanketLabel('rainSheet', 'outdoor')).toBe('Regntäcke (0 g)');
    expect(blanketLabel('rainSheet', 'stable')).toBe('Stalltäcke utan fyllning (0 g)');
  });
});

describe('errorMessage', () => {
  const shownErrors: ApiError[] = [
    { kind: 'emptyQuery' },
    { kind: 'queryTooLong' },
    { kind: 'locationNotFound' },
    { kind: 'network', timedOut: true },
    { kind: 'network', timedOut: false },
    { kind: 'serviceError', status: 500, reason: undefined },
    { kind: 'invalidResponse' },
    { kind: 'storageUnavailable' },
    { kind: 'unexpected' },
  ];

  it.each(shownErrors)('has a message for %j', (error) => {
    expect(errorMessage(error)).toMatch(/\S/);
  });

  it('shows nothing when a request was cancelled', () => {
    expect(errorMessage({ kind: 'aborted' })).toBeUndefined();
  });

  it('names the place that was not found', () => {
    expect(errorMessage({ kind: 'locationNotFound' }, ' Lnud ')).toBe(
      'Hittade ingen ort som heter "Lnud" i Sverige.',
    );
  });

  it('states the maximum length for a too long query', () => {
    expect(errorMessage({ kind: 'queryTooLong' })).toBe('Skriv högst 100 tecken.');
  });

  it('includes the status code for service errors', () => {
    expect(errorMessage({ kind: 'serviceError', status: 503, reason: 'Down' })).toContain('503');
  });
});
