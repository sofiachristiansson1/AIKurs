// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeForecastResponse } from '../api/fixtures/forecast';
import { uppsalaSearchResponse } from '../api/fixtures/geocoding';
import { HORSE_PROFILE_KEY } from '../api/horseProfileStore';
import { LAST_LOCATION_KEY } from '../api/lastLocationStore';
import { jsonResponse, stubFetch } from '../api/testHelpers';
import { App } from './App';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

/** Answers geocoding with two Uppsala matches and forecasts with the fixture (22:15, rain at 23). */
function stubOpenMeteo() {
  return stubFetch((url) =>
    Promise.resolve(
      jsonResponse(
        url.hostname.startsWith('geocoding') ? uppsalaSearchResponse : makeForecastResponse(),
      ),
    ),
  );
}

describe('App', () => {
  it('shows the app name, disclaimer and weather source', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Täckesguiden');
    expect(screen.getByText(/inte veterinärråd/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'Open-Meteo.com' })).toBeDefined();
  });

  it('goes from search and horse details to a recommendation', async () => {
    stubOpenMeteo();
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Sök ort i Sverige'), 'Uppsala{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Uppsala, Uppsala län' }));
    expect(
      await screen.findByText('Fyll i hästens ålder för att få en rekommendation.'),
    ).toBeDefined();

    await user.type(screen.getByLabelText('Ålder (år)'), '10');
    // Fixture: apparent −0.6 °C now (22:00), lowest −2.4 °C tonight with 0.6 mm rain at 23:00.
    expect(screen.getByRole('article', { name: 'Nu' }).textContent).toContain(
      'Lätt täcke (50–150 g)',
    );
    const night = screen.getByRole('article', { name: 'I natt (22–06)' });
    expect(night.textContent).toContain('Tjockt täcke (300 g+)');
    expect(night.textContent).toContain('Ska vara vattentätt');
  });

  it('shows the remembered place and horse straight away on the next visit', async () => {
    stubOpenMeteo();
    localStorage.setItem(
      LAST_LOCATION_KEY,
      JSON.stringify({
        id: 2666199,
        name: 'Uppsala',
        region: 'Uppsala län',
        country: 'Sverige',
        latitude: 59.85882,
        longitude: 17.63889,
      }),
    );
    localStorage.setItem(
      HORSE_PROFILE_KEY,
      JSON.stringify({ clipped: false, breedType: 'warmblood', housing: 'stable', ageYears: 10 }),
    );
    render(<App />);
    expect(await screen.findByRole('article', { name: 'Nu' })).toBeDefined();
    expect(screen.getByText(/Vald ort:/).textContent).toBe('Vald ort: Uppsala, Uppsala län');
  });
});
