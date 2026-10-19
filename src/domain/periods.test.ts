import { describe, expect, it } from 'vitest';
import { selectCurrentHour, selectUpcomingNight } from './periods';
import { makeHour, makeHourlyForecast } from './testHelpers';

// 2026-10-19 00:00 to 2026-10-21 23:00
const forecast = makeHourlyForecast('2026-10-19', 72);

function timesOf(period: readonly { localTime: string }[] | undefined): string[] {
  return (period ?? []).map((hour) => hour.localTime);
}

describe('selectCurrentHour', () => {
  it('returns the hour that contains the current time', () => {
    expect(timesOf(selectCurrentHour(forecast, '2026-10-19T14:35'))).toEqual(['2026-10-19T14:00']);
  });

  it('returns undefined when the forecast does not cover the current time', () => {
    expect(selectCurrentHour(forecast, '2026-10-25T14:00')).toBeUndefined();
  });
});

describe('selectUpcomingNight', () => {
  const tonight = [
    '2026-10-19T22:00',
    '2026-10-19T23:00',
    '2026-10-20T00:00',
    '2026-10-20T01:00',
    '2026-10-20T02:00',
    '2026-10-20T03:00',
    '2026-10-20T04:00',
    '2026-10-20T05:00',
    '2026-10-20T06:00',
  ];

  it('during the day selects 22:00 to 06:00 inclusive', () => {
    expect(timesOf(selectUpcomingNight(forecast, '2026-10-19T14:00'))).toEqual(tonight);
  });

  it('at 23:30 selects the rest of the night from the current hour', () => {
    expect(timesOf(selectUpcomingNight(forecast, '2026-10-19T23:30'))).toEqual(tonight.slice(1));
  });

  it('at 03:00 selects the rest of the night up to 06:00', () => {
    expect(timesOf(selectUpcomingNight(forecast, '2026-10-20T03:00'))).toEqual(tonight.slice(5));
  });

  it('at 06:30 selects the coming night, not the 06:00 hour', () => {
    const night = timesOf(selectUpcomingNight(forecast, '2026-10-20T06:30'));
    expect(night[0]).toBe('2026-10-20T22:00');
    expect(night.at(-1)).toBe('2026-10-21T06:00');
  });

  it('does not include 07:00', () => {
    expect(timesOf(selectUpcomingNight(forecast, '2026-10-19T14:00'))).not.toContain(
      '2026-10-20T07:00',
    );
  });

  it('handles an unsorted forecast', () => {
    const shuffled = [...forecast].reverse();
    expect(timesOf(selectUpcomingNight(shuffled, '2026-10-19T14:00'))).toEqual(tonight);
  });

  it('returns undefined when the forecast has no night hours ahead', () => {
    const dayOnly = [makeHour('2026-10-19T12:00'), makeHour('2026-10-19T13:00')];
    expect(selectUpcomingNight(dayOnly, '2026-10-19T12:00')).toBeUndefined();
  });
});
