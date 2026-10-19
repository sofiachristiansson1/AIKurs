/*
 * Follows the documented Open-Meteo forecast format for the request built by buildForecastUrl
 * (https://open-meteo.com/en/docs), shortened to three hours. With timezone=auto, times are local
 * at the location and have no offset; the offset is given separately in utc_offset_seconds.
 */
export function makeForecastResponse(): Record<string, unknown> {
  return {
    latitude: 59.86,
    longitude: 17.64,
    generationtime_ms: 0.08,
    utc_offset_seconds: 7200,
    timezone: 'Europe/Stockholm',
    timezone_abbreviation: 'GMT+2',
    elevation: 20,
    current_units: {
      time: 'iso8601',
      interval: 'seconds',
      temperature_2m: '°C',
      apparent_temperature: '°C',
      wind_speed_10m: 'm/s',
    },
    current: {
      time: '2026-10-19T22:15',
      interval: 900,
      temperature_2m: 3.4,
      apparent_temperature: -0.8,
      wind_speed_10m: 4.2,
    },
    hourly_units: {
      time: 'iso8601',
      temperature_2m: '°C',
      apparent_temperature: '°C',
      precipitation: 'mm',
      wind_speed_10m: 'm/s',
    },
    hourly: {
      time: ['2026-10-19T22:00', '2026-10-19T23:00', '2026-10-20T00:00'],
      temperature_2m: [3.5, 2.9, 2.1],
      apparent_temperature: [-0.6, -1.3, -2.4],
      precipitation: [0, 0.6, 0.2],
      wind_speed_10m: [4.1, 4.5, 5],
    },
  };
}
