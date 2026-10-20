// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeHour } from '../../domain/testHelpers';
import type { Forecast, HorseProfile, Location } from '../../domain/types';
import { Results } from './Results';

afterEach(cleanup);

const uppsala: Location = {
  id: 2666199,
  name: 'Uppsala',
  region: 'Uppsala län',
  country: 'Sverige',
  latitude: 59.85882,
  longitude: 17.63889,
};

const forecast: Forecast = {
  nowLocal: '2026-10-19T14:20',
  current: {
    localTime: '2026-10-19T14:20',
    temperatureC: 9.2,
    apparentTemperatureC: 6.5,
    windSpeedMs: 4.5,
  },
  hours: [
    makeHour('2026-10-19T14:00', { apparentTemperatureC: 6.5, precipitationMm: 0.3 }),
    makeHour('2026-10-19T22:00', { apparentTemperatureC: -2 }),
  ],
};

const horse: HorseProfile = {
  clipped: false,
  breedType: 'warmblood',
  housing: 'outdoor',
  ageYears: 10,
};

describe('Results', () => {
  it('shows the weather now and a recommendation for now and tonight', () => {
    render(
      <Results
        location={uppsala}
        forecastState={{ status: 'ready', forecast }}
        onRetry={vi.fn()}
        profile={horse}
      />,
    );
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Uppsala, Uppsala län kl. 14:20',
    );
    expect(screen.getByText('6,5 °C')).toBeDefined();
    expect(screen.getByText('4,5 m/s')).toBeDefined();
    expect(screen.getByText('0,3 mm')).toBeDefined();
    expect(screen.getByRole('article', { name: 'Nu' }).textContent).toContain('Inget täcke');
    expect(screen.getByRole('article', { name: 'I natt (22–06)' }).textContent).toContain(
      'Mellantjockt täcke (150–300 g)',
    );
  });

  it('asks for the age before recommending', () => {
    render(
      <Results
        location={uppsala}
        forecastState={{ status: 'ready', forecast }}
        onRetry={vi.fn()}
        profile={undefined}
      />,
    );
    expect(screen.getByText('Fyll i hästens ålder för att få en rekommendation.')).toBeDefined();
    expect(screen.queryByRole('article')).toBeNull();
  });

  it('shows loading', () => {
    render(
      <Results
        location={uppsala}
        forecastState={{ status: 'loading' }}
        onRetry={vi.fn()}
        profile={horse}
      />,
    );
    expect(screen.getByRole('status').textContent).toBe('Hämtar väder…');
  });

  it('shows an error with a retry button', async () => {
    const onRetry = vi.fn();
    render(
      <Results
        location={uppsala}
        forecastState={{ status: 'error', error: { kind: 'network', timedOut: true } }}
        onRetry={onRetry}
        profile={horse}
      />,
    );
    expect(screen.getByRole('alert').textContent).toContain(
      'Vädertjänsten svarade inte inom 10 sekunder.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Försök igen' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
