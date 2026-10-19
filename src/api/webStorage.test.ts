import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from './testHelpers';
import { getBrowserStorage } from './webStorage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getBrowserStorage', () => {
  it('returns window.localStorage when it is available', () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal('window', { localStorage });
    expect(getBrowserStorage()).toEqual({ ok: true, value: localStorage });
  });

  it('reports storageUnavailable when the browser blocks access', () => {
    vi.stubGlobal('window', {
      get localStorage(): never {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
    });
    expect(getBrowserStorage()).toEqual({ ok: false, error: { kind: 'storageUnavailable' } });
  });
});
