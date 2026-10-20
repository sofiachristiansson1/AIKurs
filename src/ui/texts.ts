import { MAX_QUERY_LENGTH } from '../api/geocoding';
import { REQUEST_TIMEOUT_MS } from '../api/http';
import type { ApiError } from '../api/result';
import { ADJUSTMENT_RULES, NIGHT_WINDOW } from '../domain/blanketRules';
import type {
  AdjustmentKind,
  BlanketLevel,
  BreedType,
  Housing,
  TemperatureBasis,
} from '../domain/types';

/** All Swedish text the user sees, in one place. */

const BLANKET_LABELS: Record<BlanketLevel, string> = {
  none: 'Inget täcke',
  rainSheet: 'Regntäcke (0 g)',
  light: 'Lätt täcke (50–150 g)',
  medium: 'Mellantjockt täcke (150–300 g)',
  heavy: 'Tjockt täcke (300 g+)',
  heavyWithNeckCover: 'Tjockt täcke + halsdel',
  heavyWithLiner: 'Tjockt täcke + underlägg',
};

export function blanketLabel(level: BlanketLevel, housing: Housing): string {
  if (level === 'rainSheet' && housing === 'stable') {
    return 'Stalltäcke utan fyllning (0 g)';
  }
  return BLANKET_LABELS[level];
}

export const BREED_LABELS: Record<BreedType, string> = {
  coldbloodOrPony: 'Kallblod/ponny',
  warmblood: 'Varmblod',
  thoroughbredOrArab: 'Fullblod/arab',
};

export const HOUSING_LABELS: Record<Housing, string> = {
  outdoor: 'Ute',
  stable: 'I stall',
};

export const ADJUSTMENT_LABELS: Record<AdjustmentKind, string> = {
  precipitation: 'Regn eller blötsnö väntas',
  youngHorse: `Unghäst (under ${ADJUSTMENT_RULES.youngHorse.underAgeYears} år)`,
  seniorHorse: `Seniorhäst (${ADJUSTMENT_RULES.seniorHorse.fromAgeYears} år eller äldre)`,
  breed: 'Fullblod/arab är känsligare för kyla',
  stable: 'Står i stall',
};

export const TEMPERATURE_BASIS_LABELS: Record<TemperatureBasis, string> = {
  apparent: 'Lägsta upplevda temperatur',
  air: 'Lägsta lufttemperatur',
};

function twoDigits(hour: number): string {
  return String(hour).padStart(2, '0');
}

export const TEXTS = {
  appName: 'Täckesguiden',
  intro: 'Sök på en ort och fyll i uppgifter om hästen, så får du ett förslag på täcke.',
  nowTitle: 'Nu',
  nightTitle: `I natt (${twoDigits(NIGHT_WINDOW.startHour)}–${twoDigits(NIGHT_WINDOW.endHour)})`,
  waterproof: 'Ska vara vattentätt',
  warmingCap: `Justeringarna är begränsade till högst +${ADJUSTMENT_RULES.maxWarmingSteps} steg.`,
  noNight: 'Prognosen räcker inte för att räkna ut natten.',
  noCurrentHour: 'Prognosen saknar värden för just nu.',
  completeHorseForm: 'Fyll i hästens ålder för att få en rekommendation.',
  disclaimer:
    'Rekommendationen är en vägledning, inte veterinärråd. Känn alltid på din häst, till exempel bakom bogen, för att se om den är för varm eller kall.',
  attribution: 'Väderdata från',
  retry: 'Försök igen',
  loadingForecast: 'Hämtar väder…',
  searching: 'Söker…',
} as const;

/** The Swedish message for an error, or undefined when nothing should be shown. */
export function errorMessage(error: ApiError, query = ''): string | undefined {
  switch (error.kind) {
    case 'emptyQuery':
      return 'Skriv minst två bokstäver.';
    case 'queryTooLong':
      return `Skriv högst ${MAX_QUERY_LENGTH} tecken.`;
    case 'locationNotFound':
      return `Hittade ingen ort som heter "${query.trim()}" i Sverige.`;
    case 'network':
      return error.timedOut
        ? `Vädertjänsten svarade inte inom ${REQUEST_TIMEOUT_MS / 1000} sekunder. Försök igen.`
        : 'Kunde inte nå vädertjänsten. Kontrollera internetanslutningen.';
    case 'serviceError':
      return `Vädertjänsten svarade med ett fel (kod ${error.status}).`;
    case 'invalidResponse':
      return 'Vädertjänsten skickade data som appen inte förstår.';
    case 'storageUnavailable':
      return 'Webbläsaren tillåter inte att appen sparar dina uppgifter. Appen fungerar, men du behöver fylla i dem igen nästa gång.';
    case 'unexpected':
      return 'Något gick fel i appen. Ladda om sidan och försök igen.';
    case 'aborted':
      return undefined;
  }
}
