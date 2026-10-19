import { NIGHT_WINDOW } from './blanketRules';
import type { LocalDateTime, WeatherHour, WeatherPeriod } from './types';

/** 'YYYY-MM-DDTHH:mm' -> 'YYYY-MM-DDTHH', identifying the hour a time falls in. */
function hourKey(localTime: LocalDateTime): string {
  return localTime.slice(0, 13);
}

function hourOfDay(hour: WeatherHour): number {
  return Number(hour.localTime.slice(11, 13));
}

/** Hours that can start a night: 22:00 up to, but not including, 06:00. */
function canStartNight(hour: WeatherHour): boolean {
  const hourOfDayValue = hourOfDay(hour);
  return hourOfDayValue >= NIGHT_WINDOW.startHour || hourOfDayValue < NIGHT_WINDOW.endHour;
}

/** Hours that belong to a night once it has started: 22:00 through 06:00. */
function isInNight(hour: WeatherHour): boolean {
  const hourOfDayValue = hourOfDay(hour);
  return hourOfDayValue >= NIGHT_WINDOW.startHour || hourOfDayValue <= NIGHT_WINDOW.endHour;
}

function toPeriod(hours: readonly WeatherHour[]): WeatherPeriod | undefined {
  const [first, ...rest] = hours;
  return first === undefined ? undefined : [first, ...rest];
}

function hoursFromNow(hours: readonly WeatherHour[], nowLocal: LocalDateTime): WeatherHour[] {
  const nowKey = hourKey(nowLocal);
  return [...hours]
    .sort((a, b) => a.localTime.localeCompare(b.localTime))
    .filter((hour) => hourKey(hour.localTime) >= nowKey);
}

/** The forecast hour that contains the current time, as a one-hour period. */
export function selectCurrentHour(
  hours: readonly WeatherHour[],
  nowLocal: LocalDateTime,
): WeatherPeriod | undefined {
  const current = hours.find((hour) => hourKey(hour.localTime) === hourKey(nowLocal));
  return current === undefined ? undefined : [current];
}

/**
 * The first run of night hours from the current hour onwards. During the night this is the
 * rest of the current night; otherwise it is the coming night.
 */
export function selectUpcomingNight(
  hours: readonly WeatherHour[],
  nowLocal: LocalDateTime,
): WeatherPeriod | undefined {
  const upcoming = hoursFromNow(hours, nowLocal);
  const startIndex = upcoming.findIndex(canStartNight);
  if (startIndex === -1) {
    return undefined;
  }
  const fromStart = upcoming.slice(startIndex);
  const endIndex = fromStart.findIndex((hour) => !isInNight(hour));
  return toPeriod(endIndex === -1 ? fromStart : fromStart.slice(0, endIndex));
}
