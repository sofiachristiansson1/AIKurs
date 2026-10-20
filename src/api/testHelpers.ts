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
        const abort = () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        };
        // Like the real fetch, reject at once if the signal is already aborted.
        if (init?.signal?.aborted === true) {
          abort();
        }
        init?.signal?.addEventListener('abort', abort);
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

/** In-memory stand-in for localStorage. */
export function createMemoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    items,
  };
}

/** A storage that throws on every call, like a browser with site data blocked. */
export function createBrokenStorage() {
  const fail = (): never => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  };
  return { getItem: fail, setItem: fail };
}
