import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson } from './http';
import { jsonResponse, stubFetch, stubFetchJson, stubHangingFetch } from './testHelpers';

const url = new URL('https://example.test/data');

afterEach(() => {
  vi.unstubAllGlobals();
});

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
  });

  it('returns a network error when the request fails', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await getJson(url)).toEqual({
      ok: false,
      error: { kind: 'network', timedOut: false },
    });
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
});
