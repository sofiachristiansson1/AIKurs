import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { noMatchSearchResponse, uppsalaSearchResponse } from './fixtures/geocoding';
import { searchLocations, toLocation } from './geocoding';
import { requestedUrl, stubFetch, stubFetchJson } from './testHelpers';

beforeEach(() => {
  // Rejected responses are logged; keep the test output clean.
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('searchLocations', () => {
  it('asks Open-Meteo for Swedish places with Swedish names', async () => {
    const fetchMock = stubFetchJson(uppsalaSearchResponse);
    await searchLocations('  Uppsala ');
    const url = requestedUrl(fetchMock);
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      name: 'Uppsala',
      count: '10',
      language: 'sv',
      countryCode: 'SE',
      format: 'json',
    });
  });

  it('maps every match to a Location', async () => {
    stubFetchJson(uppsalaSearchResponse);
    expect(await searchLocations('Uppsala')).toEqual({
      ok: true,
      value: [
        {
          id: 2666199,
          name: 'Uppsala',
          region: 'Uppsala län',
          country: 'Sverige',
          latitude: 59.85882,
          longitude: 17.63889,
        },
        {
          id: 2666222,
          name: 'Uppsala',
          region: 'Örebro län',
          country: 'Sverige',
          latitude: 58.81667,
          longitude: 15.03333,
        },
      ],
    });
  });

  it.each(['', '   ', 'U'])(
    'returns emptyQuery for %j without calling the service',
    async (query) => {
      const fetchMock = stubFetchJson(uppsalaSearchResponse);
      expect(await searchLocations(query)).toEqual({ ok: false, error: { kind: 'emptyQuery' } });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('accepts a query of exactly the maximum length', async () => {
    const fetchMock = stubFetchJson(uppsalaSearchResponse);
    await searchLocations('a'.repeat(100));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns queryTooLong for a longer query without calling the service', async () => {
    const fetchMock = stubFetchJson(uppsalaSearchResponse);
    expect(await searchLocations('a'.repeat(101))).toEqual({
      ok: false,
      error: { kind: 'queryTooLong' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns locationNotFound when the response has no results field', async () => {
    stubFetchJson(noMatchSearchResponse);
    expect(await searchLocations('Xqzzy')).toEqual({
      ok: false,
      error: { kind: 'locationNotFound' },
    });
  });

  it('returns locationNotFound for an empty results list', async () => {
    stubFetchJson({ results: [] });
    expect(await searchLocations('Xqzzy')).toEqual({
      ok: false,
      error: { kind: 'locationNotFound' },
    });
  });

  it('skips incomplete matches', async () => {
    stubFetchJson({
      results: [
        { id: 1, name: 'Utan koordinater', country: 'Sverige' },
        { id: 2, name: 'Lund', country: 'Sverige', latitude: 55.7, longitude: 13.19 },
      ],
    });
    const result = await searchLocations('Lund');
    expect(result.ok && result.value.map((location) => location.id)).toEqual([2]);
  });

  it('skips matches with coordinates out of range or overly long names', async () => {
    stubFetchJson({
      results: [
        { id: 1, name: 'Fel latitud', country: 'Sverige', latitude: 91, longitude: 13 },
        { id: 2, name: 'Fel longitud', country: 'Sverige', latitude: 55, longitude: -181 },
        { id: 3, name: 'a'.repeat(201), country: 'Sverige', latitude: 55, longitude: 13 },
        { id: 4, name: 'Lund', country: 'Sverige', latitude: 55.7, longitude: 13.19 },
      ],
    });
    const result = await searchLocations('Lund');
    expect(result.ok && result.value.map((location) => location.id)).toEqual([4]);
  });

  it('returns invalidResponse when no match is usable', async () => {
    stubFetchJson({ results: [{ id: 1 }] });
    expect(await searchLocations('Lund')).toEqual({
      ok: false,
      error: { kind: 'invalidResponse' },
    });
  });

  it('returns invalidResponse when results is not a list', async () => {
    stubFetchJson({ results: 'Lund' });
    expect(await searchLocations('Lund')).toEqual({
      ok: false,
      error: { kind: 'invalidResponse' },
    });
  });

  it('logs why a search response was rejected', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    stubFetchJson({ results: 'Lund' });
    await searchLocations('Lund');
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('not a list'), 'Lund');
  });

  it('passes on network errors', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await searchLocations('Lund')).toEqual({
      ok: false,
      error: { kind: 'network', timedOut: false },
    });
  });

  it('passes on service errors with the reason', async () => {
    stubFetchJson({ error: true, reason: 'Parameter count must be between 1 and 100.' }, 400);
    expect(await searchLocations('Lund')).toEqual({
      ok: false,
      error: {
        kind: 'serviceError',
        status: 400,
        reason: 'Parameter count must be between 1 and 100.',
      },
    });
  });
});

describe('toLocation', () => {
  it('leaves out region when admin1 is missing', () => {
    expect(
      toLocation({ id: 3, name: 'Visby', country: 'Sverige', latitude: 57.64, longitude: 18.3 }),
    ).toEqual({ id: 3, name: 'Visby', country: 'Sverige', latitude: 57.64, longitude: 18.3 });
  });
});
