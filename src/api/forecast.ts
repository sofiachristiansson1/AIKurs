import type { CurrentWeather, Forecast, Location, WeatherHour } from '../domain/types';
import { getJson, type RequestOptions } from './http';
import { err, ok, type ApiError, type Result } from './result';
import { asArray, asFiniteNumber, asLocalDateTime, isRecord } from './validation';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
/** Two days always covers the coming night, even late in the evening. */
const FORECAST_DAYS = 2;

const HOURLY_VARIABLES = {
  temperatureC: 'temperature_2m',
  apparentTemperatureC: 'apparent_temperature',
  precipitationMm: 'precipitation',
  windSpeedMs: 'wind_speed_10m',
} as const;

const CURRENT_VARIABLES = ['temperature_2m', 'apparent_temperature', 'wind_speed_10m'] as const;

/** Units we ask for and check in the response, so a unit mix-up can never pass silently. */
const EXPECTED_UNITS: Readonly<Record<string, string>> = {
  temperature_2m: '°C',
  apparent_temperature: '°C',
  precipitation: 'mm',
  wind_speed_10m: 'm/s',
};

export async function fetchForecast(
  location: Pick<Location, 'latitude' | 'longitude'>,
  options: RequestOptions = {},
): Promise<Result<Forecast, ApiError>> {
  const response = await getJson(buildForecastUrl(location), options);
  return response.ok ? parseForecastResponse(response.value) : response;
}

export function buildForecastUrl(location: Pick<Location, 'latitude' | 'longitude'>): URL {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: Object.values(HOURLY_VARIABLES).join(','),
    current: CURRENT_VARIABLES.join(','),
    wind_speed_unit: 'ms',
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
  }).toString();
  return url;
}

export function parseForecastResponse(body: unknown): Result<Forecast, ApiError> {
  if (!isRecord(body)) {
    return err({ kind: 'invalidResponse' });
  }
  const unitsOk =
    hasExpectedUnits(body.current_units, CURRENT_VARIABLES) &&
    hasExpectedUnits(body.hourly_units, Object.values(HOURLY_VARIABLES));
  const current = unitsOk ? parseCurrent(body.current) : undefined;
  const hours = unitsOk ? parseHourly(body.hourly) : undefined;
  if (current === undefined || hours === undefined || hours.length === 0) {
    return err({ kind: 'invalidResponse' });
  }
  return ok({ nowLocal: current.localTime, current, hours });
}

function hasExpectedUnits(units: unknown, variables: readonly string[]): boolean {
  return (
    isRecord(units) && variables.every((variable) => units[variable] === EXPECTED_UNITS[variable])
  );
}

function parseCurrent(value: unknown): CurrentWeather | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const localTime = asLocalDateTime(value.time);
  const temperatureC = asFiniteNumber(value.temperature_2m);
  const apparentTemperatureC = asFiniteNumber(value.apparent_temperature);
  const windSpeedMs = asFiniteNumber(value.wind_speed_10m);
  if (
    localTime === undefined ||
    temperatureC === undefined ||
    apparentTemperatureC === undefined ||
    windSpeedMs === undefined
  ) {
    return undefined;
  }
  return { localTime, temperatureC, apparentTemperatureC, windSpeedMs };
}

/** Maps the column-per-variable hourly arrays to one object per hour, skipping hours with gaps. */
function parseHourly(value: unknown): WeatherHour[] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const times = asArray(value.time);
  const columns = Object.values(HOURLY_VARIABLES).map((variable) => asArray(value[variable]));
  if (times === undefined || columns.some((column) => column?.length !== times.length)) {
    return undefined;
  }
  return times
    .map((time, index) => toWeatherHour(time, (variable) => value[variable], index))
    .filter((hour) => hour !== undefined);
}

function toWeatherHour(
  time: unknown,
  readColumn: (variable: string) => unknown,
  index: number,
): WeatherHour | undefined {
  const valueAt = (variable: string) => asFiniteNumber(asArray(readColumn(variable))?.[index]);
  const localTime = asLocalDateTime(time);
  const temperatureC = valueAt(HOURLY_VARIABLES.temperatureC);
  const apparentTemperatureC = valueAt(HOURLY_VARIABLES.apparentTemperatureC);
  const precipitationMm = valueAt(HOURLY_VARIABLES.precipitationMm);
  const windSpeedMs = valueAt(HOURLY_VARIABLES.windSpeedMs);
  if (
    localTime === undefined ||
    temperatureC === undefined ||
    apparentTemperatureC === undefined ||
    precipitationMm === undefined ||
    windSpeedMs === undefined
  ) {
    return undefined;
  }
  return { localTime, temperatureC, apparentTemperatureC, precipitationMm, windSpeedMs };
}
