import { afterEach, describe, expect, it, vi } from 'vitest';
import { catchUnexpected, ok, rejectResponse, reportUnexpected } from './result';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reportUnexpected', () => {
  it('logs the cause and returns an unexpected error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const cause = new Error('bug');
    expect(reportUnexpected(cause)).toEqual({ kind: 'unexpected' });
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), cause);
  });
});

describe('rejectResponse', () => {
  it('logs what was wrong and returns invalidResponse', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const data = { units: 'km/h' };
    expect(rejectResponse('unexpected units', data)).toEqual({ kind: 'invalidResponse' });
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('unexpected units'), data);
  });
});

describe('catchUnexpected', () => {
  it('passes a result through unchanged', async () => {
    expect(await catchUnexpected(Promise.resolve(ok(1)))).toEqual({ ok: true, value: 1 });
  });

  it('turns a rejection into an unexpected error and logs it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(await catchUnexpected(Promise.reject(new Error('bug')))).toEqual({
      ok: false,
      error: { kind: 'unexpected' },
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});
