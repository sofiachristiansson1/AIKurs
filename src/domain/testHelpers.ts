import type { WeatherHour } from './types';

/** Builds a forecast hour for tests with mild, dry defaults. */
export function makeHour(localTime: string, overrides: Partial<WeatherHour> = {}): WeatherHour {
  return {
    localTime,
    temperatureC: 10,
    apparentTemperatureC: 10,
    windSpeedMs: 0,
    precipitationMm: 0,
    ...overrides,
  };
}

/** Hourly forecast from 'YYYY-MM-DDT00:00' on startDate and the given number of hours on. */
export function makeHourlyForecast(startDate: string, hourCount: number): WeatherHour[] {
  const [year, month, day] = startDate.split('-').map(Number);
  return Array.from({ length: hourCount }, (_, offset) => {
    const dayOffset = Math.floor(offset / 24);
    const date = `${year}-${String(month).padStart(2, '0')}-${String((day ?? 0) + dayOffset).padStart(2, '0')}`;
    return makeHour(`${date}T${String(offset % 24).padStart(2, '0')}:00`);
  });
}
