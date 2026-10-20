import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getJson } from './http';
import { jsonResponse, stubFetch, stubFetchJson, stubHangingFetch } from './testHelpers';

const url = new URL('https://example.test/data');

let consoleWarn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Removes AbortSignal.any and AbortSignal.timeout while `run` runs, like Safari before 17.4. */
async function withoutModernAbortSignal(run: () => Promise<void>): Promise<void> {
  const names = ['any', 'timeout'] as const;
  const originals = names.map((name) => Object.getOwnPropertyDescriptor(AbortSignal, name));
  for (const name of names) {
    Object.defineProperty(AbortSignal, name, { value: undefined, configurable: true });
  }
  try {
    await run();
  } finally {
    names.forEach((name, index) => {
      const original = originals[index];
      if (original !== undefined) {
        Object.defineProperty(AbortSignal, name, original);
      }
    });
  }
}

describe('getJson', () => {
  it('returns the parsed body on success', async () => {
    stubFetchJson({ value: 1 });
    expect(await getJson(url)).toEqual({ ok: true, value: { value: 1 } });
  });

  it('returns serviceError with the reason Open-Meteo gives', async () => {
    stubFetchJson({ error: true, reason: 'Latitude must be in range of -90 to 90°.' }, 400);
    expect(await getJson(url)).toEqual({
      ok: false,
      error: {
        kind: 'serviceError',
        status: 400,
        reason: 'Latitude must be in range of -90 to 90°.',
      },
    });
  });

  it('logs the reason Open-Meteo gives, since users never see it', async () => {
    stubFetchJson({ error: true, reason: 'Latitude must be in range of -90 to 90°.' }, 400);
    await getJson(url);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('400'),
      'Latitude must be in range of -90 to 90°.',
    );
  });

  it('returns serviceError without reason for a non-JSON error page', async () => {
    stubFetch(() => Promise.resolve(new Response('<html>Bad gateway</html>', { status: 502 })));
    expect(await getJson(url)).toEqual({
      ok: false,
      error: { kind: 'serviceError', status: 502, reason: undefined },
    });
  });

  it('returns invalidResponse when a successful response is not JSON', async () => {
    stubFetch(() => Promise.resolve(new Response('not json', { status: 200 })));
    expect(await getJson(url)).toEqual({ ok: false, error: { kind: 'invalidResponse' } });
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('not JSON'), undefined);
  });

  it('returns a network error when the request fails', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await getJson(url)).toEqual({
      ok: false,
      error: { kind: 'network', timedOut: false },
    });
  });

  it('returns unexpected, not a network error, when something other than the network fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    stubFetch(() => Promise.reject(new Error('bug in the app')));
    expect(await getJson(url)).toEqual({ ok: false, error: { kind: 'unexpected' } });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('returns a timed-out network error when the server does not answer in time', async () => {
    stubHangingFetch();
    expect(await getJson(url, { timeoutMs: 5 })).toEqual({
      ok: false,
      error: { kind: 'network', timedOut: true },
    });
  });

  it('returns aborted when the caller cancels', async () => {
    stubHangingFetch();
    const controller = new AbortController();
    const pending = getJson(url, { signal: controller.signal });
    controller.abort();
    expect(await pending).toEqual({ ok: false, error: { kind: 'aborted' } });
  });

  it('passes the URL and a signal to fetch', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(jsonResponse({})));
    await getJson(url);
    expect(fetchMock).toHaveBeenCalledWith(url, { signal: expect.any(AbortSignal) as unknown });
  });

  it('works in browsers without AbortSignal.any and AbortSignal.timeout', async () => {
    stubFetchJson({ value: 1 });
    await withoutModernAbortSignal(async () => {
      expect(await getJson(url, { signal: new AbortController().signal })).toEqual({
        ok: true,
        value: { value: 1 },
      });
    });
  });

  it('still times out in browsers without AbortSignal.any and AbortSignal.timeout', async () => {
    stubHangingFetch();
    await withoutModernAbortSignal(async () => {
      expect(await getJson(url, { timeoutMs: 5 })).toEqual({
        ok: false,
        error: { kind: 'network', timedOut: true },
      });
    });
  });

  it('returns aborted when the caller cancelled before the request started', async () => {
    stubHangingFetch();
    const controller = new AbortController();
    controller.abort();
    expect(await getJson(url, { signal: controller.signal })).toEqual({
      ok: false,
      error: { kind: 'aborted' },
    });
  });
});
