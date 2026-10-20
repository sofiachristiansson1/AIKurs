import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchForecast, parseForecastResponse } from './forecast';
import { makeForecastResponse } from './fixtures/forecast';
import { requestedUrl, stubFetchJson, stubHangingFetch } from './testHelpers';

const uppsala = { latitude: 59.85882, longitude: 17.63889 };

beforeEach(() => {
  // Rejected responses are logged; keep the test output clean.
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function withChange(change: (response: Record<string, unknown>) => void): unknown {
  const response = makeForecastResponse();
  change(response);
  return response;
}

function hourly(response: Record<string, unknown>): Record<string, unknown[]> {
  return response.hourly as Record<string, unknown[]>;
}

describe('fetchForecast', () => {
  it('asks for hourly and current values in m/s and local time', async () => {
    const fetchMock = stubFetchJson(makeForecastResponse());
    await fetchForecast(uppsala);
    const url = requestedUrl(fetchMock);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '59.85882',
      longitude: '17.63889',
      hourly: 'temperature_2m,apparent_temperature,precipitation,wind_speed_10m',
      current: 'temperature_2m,apparent_temperature,wind_speed_10m',
      wind_speed_unit: 'ms',
      timezone: 'auto',
      forecast_days: '2',
    });
  });

  it('maps the response to a Forecast', async () => {
    stubFetchJson(makeForecastResponse());
    const result = await fetchForecast(uppsala);
    expect(result).toEqual({
      ok: true,
      value: {
        nowLocal: '2026-10-19T22:15',
        current: {
          localTime: '2026-10-19T22:15',
          temperatureC: 3.4,
          apparentTemperatureC: -0.8,
          windSpeedMs: 4.2,
        },
        hours: [
          {
            localTime: '2026-10-19T22:00',
            temperatureC: 3.5,
            apparentTemperatureC: -0.6,
            precipitationMm: 0,
            windSpeedMs: 4.1,
          },
          {
            localTime: '2026-10-19T23:00',
            temperatureC: 2.9,
            apparentTemperatureC: -1.3,
            precipitationMm: 0.6,
            windSpeedMs: 4.5,
          },
          {
            localTime: '2026-10-20T00:00',
            temperatureC: 2.1,
            apparentTemperatureC: -2.4,
            precipitationMm: 0.2,
            windSpeedMs: 5,
          },
        ],
      },
    });
  });

  it('returns a timed-out network error when the service does not answer', async () => {
    stubHangingFetch();
    expect(await fetchForecast(uppsala, { timeoutMs: 5 })).toEqual({
      ok: false,
      error: { kind: 'network', timedOut: true },
    });
  });

  it('passes on service errors with the reason', async () => {
    stubFetchJson({ error: true, reason: 'Latitude must be in range of -90 to 90°.' }, 400);
    expect(await fetchForecast({ latitude: 999, longitude: 17 })).toEqual({
      ok: false,
      error: {
        kind: 'serviceError',
        status: 400,
        reason: 'Latitude must be in range of -90 to 90°.',
      },
    });
  });
});

describe('parseForecastResponse', () => {
  const invalid = { ok: false, error: { kind: 'invalidResponse' } };

  it('skips hours with missing values', () => {
    const response = withChange((r) => {
      hourly(r).temperature_2m = [3.5, null, 2.1];
    });
    const result = parseForecastResponse(response);
    expect(result.ok && result.value.hours.map((hour) => hour.localTime)).toEqual([
      '2026-10-19T22:00',
      '2026-10-20T00:00',
    ]);
  });

  it.each([
    ['temperature_2m', 61],
    ['temperature_2m', -91],
    ['apparent_temperature', 81],
    ['apparent_temperature', -121],
    ['precipitation', -0.1],
    ['precipitation', 501],
    ['wind_speed_10m', -1],
    ['wind_speed_10m', 121],
  ])('skips an hour where %s is implausible (%s)', (variable, value) => {
    const response = withChange((r) => {
      const column = hourly(r)[variable];
      if (column !== undefined) {
        column[1] = value;
      }
    });
    const result = parseForecastResponse(response);
    expect(result.ok && result.value.hours.map((hour) => hour.localTime)).toEqual([
      '2026-10-19T22:00',
      '2026-10-20T00:00',
    ]);
  });

  it('keeps values at the edge of the plausible ranges', () => {
    const response = withChange((r) => {
      hourly(r).temperature_2m = [60, -90, 2.1];
      hourly(r).apparent_temperature = [80, -120, -2.4];
      hourly(r).precipitation = [0, 500, 0.2];
      hourly(r).wind_speed_10m = [0, 120, 5];
    });
    const result = parseForecastResponse(response);
    expect(result.ok && result.value.hours).toHaveLength(3);
  });

  it.each([
    ['temperature_2m', 61],
    ['apparent_temperature', -121],
    ['wind_speed_10m', 121],
  ])('rejects current weather where %s is implausible (%s)', (variable, value) => {
    const response = withChange((r) => {
      (r.current as Record<string, unknown>)[variable] = value;
    });
    expect(parseForecastResponse(response)).toEqual(invalid);
  });

  it('skips an hour with an impossible clock time', () => {
    const response = withChange((r) => {
      hourly(r).time = ['2026-10-19T22:00', '2026-10-19T99:00', '2026-10-20T00:00'];
    });
    const result = parseForecastResponse(response);
    expect(result.ok && result.value.hours.map((hour) => hour.localTime)).toEqual([
      '2026-10-19T22:00',
      '2026-10-20T00:00',
    ]);
  });

  it('rejects hourly lists of different lengths', () => {
    const response = withChange((r) => {
      hourly(r).precipitation = [0, 0.6];
    });
    expect(parseForecastResponse(response)).toEqual(invalid);
  });

  it('rejects a response where every hour has gaps', () => {
    const response = withChange((r) => {
      hourly(r).temperature_2m = [null, null, null];
    });
    expect(parseForecastResponse(response)).toEqual(invalid);
  });

  it('rejects wind speed in another unit than m/s', () => {
    const response = withChange((r) => {
      (r.hourly_units as Record<string, unknown>).wind_speed_10m = 'km/h';
    });
    expect(parseForecastResponse(response)).toEqual(invalid);
  });

  it('rejects times with an unexpected format', () => {
    const response = withChange((r) => {
      (r.current as Record<string, unknown>).time = '2026-10-19T22:15:00Z';
    });
    expect(parseForecastResponse(response)).toEqual(invalid);
  });

  it('logs which part of the forecast was wrong', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const response = withChange((r) => {
      (r.hourly_units as Record<string, unknown>).wind_speed_10m = 'km/h';
    });
    parseForecastResponse(response);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('unexpected units'),
      expect.anything(),
    );
  });

  it.each([null, 'text', {}])('rejects %j', (body) => {
    expect(parseForecastResponse(body)).toEqual(invalid);
  });
});
