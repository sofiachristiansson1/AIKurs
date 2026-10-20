import { recommendForForecast } from '../../domain/recommendForForecast';
import type { Forecast, HorseProfile, Location } from '../../domain/types';
import type { ForecastState } from '../hooks/useForecast';
import { TEXTS } from '../texts';
import { ErrorMessage } from './ErrorMessage';
import { RecommendationCard } from './RecommendationCard';
import { WeatherSummary } from './WeatherSummary';

interface ResultsProps {
  readonly location: Location | undefined;
  readonly forecastState: ForecastState;
  readonly onRetry: () => void;
  readonly profile: HorseProfile | undefined;
}

export function Results({ location, forecastState, onRetry, profile }: ResultsProps) {
  return (
    <div className="results" aria-live="polite">
      {forecastState.status === 'loading' && <p role="status">{TEXTS.loadingForecast}</p>}
      {forecastState.status === 'error' && (
        <ErrorMessage error={forecastState.error} onRetry={onRetry} />
      )}
      {forecastState.status === 'ready' && location !== undefined && (
        <>
          <WeatherSummary location={location} forecast={forecastState.forecast} />
          {profile === undefined ? (
            <p className="card">{TEXTS.completeHorseForm}</p>
          ) : (
            <Recommendations forecast={forecastState.forecast} profile={profile} />
          )}
        </>
      )}
    </div>
  );
}

function Recommendations({
  forecast,
  profile,
}: {
  readonly forecast: Forecast;
  readonly profile: HorseProfile;
}) {
  const { now, night } = recommendForForecast(forecast, profile);
  return (
    <section className="recommendations" aria-label="Täckesrekommendation">
      <RecommendationCard
        title={TEXTS.nowTitle}
        recommendation={now}
        housing={profile.housing}
        missingText={TEXTS.noCurrentHour}
      />
      <RecommendationCard
        title={TEXTS.nightTitle}
        recommendation={night}
        housing={profile.housing}
        missingText={TEXTS.noNight}
      />
    </section>
  );
}
