// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Recommendation } from '../../domain/types';
import { RecommendationCard } from './RecommendationCard';

afterEach(cleanup);

const rainyNight: Recommendation = {
  level: 'light',
  baseLevel: 'none',
  requiresWaterproof: true,
  lowestTemperatureC: 7.84,
  temperatureBasis: 'apparent',
  adjustments: [
    { kind: 'precipitation', steps: 1 },
    { kind: 'seniorHorse', steps: 1 },
    { kind: 'breed', steps: 1 },
  ],
  warmingCapApplied: true,
};

describe('RecommendationCard', () => {
  it('shows the blanket, the waterproof note and the reasons', () => {
    render(
      <RecommendationCard
        title="I natt (22–06)"
        recommendation={rainyNight}
        housing="outdoor"
        missingText="saknas"
      />,
    );
    const card = screen.getByRole('article', { name: 'I natt (22–06)' });
    expect(within(card).getByText('Lätt täcke (50–150 g)')).toBeDefined();
    expect(within(card).getByText('Ska vara vattentätt')).toBeDefined();
    const reasons = within(card)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(reasons).toEqual([
      'Lägsta upplevda temperatur: 7,8 °C',
      'Regn eller blötsnö väntas: +1 steg',
      'Seniorhäst (20 år eller äldre): +1 steg',
      'Fullblod/arab är känsligare för kyla: +1 steg',
      'Justeringarna är begränsade till högst +2 steg.',
    ]);
  });

  it('calls the 0 g level a stable sheet for a stabled horse', () => {
    render(
      <RecommendationCard
        title="Nu"
        recommendation={{
          ...rainyNight,
          level: 'rainSheet',
          requiresWaterproof: false,
          temperatureBasis: 'air',
          adjustments: [{ kind: 'stable', steps: -1 }],
          warmingCapApplied: false,
        }}
        housing="stable"
        missingText="saknas"
      />,
    );
    expect(screen.getByText('Stalltäcke utan fyllning (0 g)')).toBeDefined();
    expect(screen.getByText('Står i stall: −1 steg')).toBeDefined();
    expect(screen.queryByText('Ska vara vattentätt')).toBeNull();
  });

  it('explains when the forecast does not cover the period', () => {
    render(
      <RecommendationCard
        title="I natt (22–06)"
        recommendation={undefined}
        housing="outdoor"
        missingText="Prognosen räcker inte för att räkna ut natten."
      />,
    );
    expect(screen.getByText('Prognosen räcker inte för att räkna ut natten.')).toBeDefined();
  });
});
