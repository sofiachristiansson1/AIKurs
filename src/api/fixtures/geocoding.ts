/*
 * Based on a real Open-Meteo geocoding response (search "Uppsala", countryCode=SE, 2026-10-19),
 * with fields the app does not use trimmed.
 * When nothing matches, the response has no "results" field at all.
 */
export const uppsalaSearchResponse: unknown = {
  results: [
    {
      id: 2666199,
      name: 'Uppsala',
      latitude: 59.85882,
      longitude: 17.63889,
      elevation: 20,
      feature_code: 'PPLA',
      country_code: 'SE',
      timezone: 'Europe/Stockholm',
      population: 177074,
      country: 'Sverige',
      admin1: 'Uppsala län',
    },
    {
      id: 2666222,
      name: 'Uppsala',
      latitude: 58.81667,
      longitude: 15.03333,
      elevation: 104,
      feature_code: 'PPL',
      country_code: 'SE',
      timezone: 'Europe/Stockholm',
      country: 'Sverige',
      admin1: 'Örebro län',
    },
  ],
  generationtime_ms: 0.51,
};

export const noMatchSearchResponse: unknown = { generationtime_ms: 0.10275841 };
