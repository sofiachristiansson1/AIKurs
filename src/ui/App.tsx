import { Attribution } from './components/Attribution';
import { Disclaimer } from './components/Disclaimer';
import { ErrorMessage } from './components/ErrorMessage';
import { HorseForm } from './components/HorseForm';
import { LocationSearch } from './components/LocationSearch';
import { Results } from './components/Results';
import { useForecast } from './hooks/useForecast';
import { useHorseProfile } from './hooks/useHorseProfile';
import { useLastLocation } from './hooks/useLastLocation';
import { TEXTS } from './texts';

export function App() {
  const horse = useHorseProfile();
  const place = useLastLocation();
  const forecast = useForecast(place.location);
  const storageError = horse.storageError ?? place.storageError;

  return (
    <div className="app">
      <header className="app-header">
        <h1>{TEXTS.appName}</h1>
        <p>{TEXTS.intro}</p>
      </header>
      <main>
        {storageError !== undefined && <ErrorMessage error={storageError} />}
        <LocationSearch selected={place.location} onSelect={place.selectLocation} />
        <Results
          location={place.location}
          forecastState={forecast.state}
          onRetry={forecast.retry}
          profile={horse.profile}
        />
        <HorseForm draft={horse.draft} onChange={horse.updateDraft} />
        <Disclaimer />
      </main>
      <footer>
        <Attribution />
      </footer>
    </div>
  );
}
