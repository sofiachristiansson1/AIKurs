import { selectCurrentHour } from '../../domain/periods';
import type { Forecast, Location } from '../../domain/types';
import {
  formatClockTime,
  formatLocation,
  formatPrecipitation,
  formatTemperature,
  formatWindSpeed,
} from '../format';

interface WeatherSummaryProps {
  readonly location: Location;
  readonly forecast: Forecast;
}

export function WeatherSummary({ location, forecast }: WeatherSummaryProps) {
  const { current } = forecast;
  const precipitationMm = selectCurrentHour(forecast.hours, forecast.nowLocal)?.[0].precipitationMm;
  return (
    <section className="card" aria-label="Vädret just nu">
      <h2>
        {formatLocation(location)}{' '}
        <span className="muted">{formatClockTime(forecast.nowLocal)}</span>
      </h2>
      <dl className="weather">
        <div>
          <dt>Temperatur</dt>
          <dd>{formatTemperature(current.temperatureC)}</dd>
        </div>
        <div>
          <dt>Upplevd temperatur</dt>
          <dd>{formatTemperature(current.apparentTemperatureC)}</dd>
        </div>
        <div>
          <dt>Vind</dt>
          <dd>{formatWindSpeed(current.windSpeedMs)}</dd>
        </div>
        <div>
          <dt>Nederbörd senaste timmen</dt>
          <dd>{precipitationMm === undefined ? '–' : formatPrecipitation(precipitationMm)}</dd>
        </div>
      </dl>
    </section>
  );
}
