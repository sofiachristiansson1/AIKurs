import { vi } from 'vitest';

export type FetchMock = ReturnType<typeof stubFetch>;

/** Replaces the global fetch with a mock. Call vi.unstubAllGlobals() after each test. */
export function stubFetch(implementation: (url: URL, init?: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function stubFetchJson(body: unknown, status = 200): FetchMock {
  return stubFetch(() => Promise.resolve(jsonResponse(body, status)));
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** A fetch that never answers until its signal aborts, like a hanging server. */
export function stubHangingFetch(): FetchMock {
  return stubFetch(
    (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
  );
}

/** The URL passed to the first fetch call. */
export function requestedUrl(fetchMock: FetchMock): URL {
  const url = fetchMock.mock.calls[0]?.[0];
  if (url === undefined) {
    throw new Error('fetch was not called');
  }
  return url;
}
