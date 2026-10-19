import { selectCurrentHour, selectUpcomingNight } from './periods';
import { recommendBlanket } from './recommendBlanket';
import type { Forecast, HorseProfile, Recommendation } from './types';

export interface ForecastRecommendations {
  /** Undefined when the forecast does not cover the current hour. */
  readonly now: Recommendation | undefined;
  /** Undefined when the forecast does not reach the coming night. */
  readonly night: Recommendation | undefined;
}

export function recommendForForecast(
  forecast: Forecast,
  horse: HorseProfile,
): ForecastRecommendations {
  const currentHour = selectCurrentHour(forecast.hours, forecast.nowLocal);
  const night = selectUpcomingNight(forecast.hours, forecast.nowLocal);
  return {
    now: currentHour === undefined ? undefined : recommendBlanket(currentHour, horse),
    night: night === undefined ? undefined : recommendBlanket(night, horse),
  };
}
