/** Blanket levels ordered from lightest to warmest. Adjustments move along this scale. */
export const BLANKET_LEVELS = [
  'none',
  'rainSheet',
  'light',
  'medium',
  'heavy',
  'heavyWithNeckCover',
  'heavyWithLiner',
] as const;

export type BlanketLevel = (typeof BLANKET_LEVELS)[number];

export type BreedType = 'coldbloodOrPony' | 'warmblood' | 'thoroughbredOrArab';

export type Housing = 'outdoor' | 'stable';

export type AgeGroup = 'young' | 'adult' | 'senior';

export interface HorseProfile {
  readonly clipped: boolean;
  readonly breedType: BreedType;
  readonly housing: Housing;
  readonly ageYears: number;
}

/**
 * Local wall-clock time at the forecast location, formatted 'YYYY-MM-DDTHH:mm'.
 * Kept as a string so domain code never needs Date, and values sort correctly as text.
 */
export type LocalDateTime = string;

export interface WeatherHour {
  readonly localTime: LocalDateTime;
  readonly temperatureC: number;
  readonly apparentTemperatureC: number;
  readonly windSpeedMs: number;
  /** Precipitation during the hour, i.e. mm/h. */
  readonly precipitationMm: number;
}

/** A non-empty run of forecast hours that a recommendation is based on. */
export type WeatherPeriod = readonly [WeatherHour, ...WeatherHour[]];

export type TemperatureBasis = 'apparent' | 'air';

export type AdjustmentKind = 'precipitation' | 'youngHorse' | 'seniorHorse' | 'breed' | 'stable';

export interface Adjustment {
  readonly kind: AdjustmentKind;
  /** Positive steps mean a warmer blanket, negative a lighter one. */
  readonly steps: number;
}

export interface Recommendation {
  readonly level: BlanketLevel;
  readonly baseLevel: BlanketLevel;
  readonly requiresWaterproof: boolean;
  readonly lowestTemperatureC: number;
  readonly temperatureBasis: TemperatureBasis;
  readonly adjustments: readonly Adjustment[];
  /** True when the warming adjustments added up to more than the cap allows. */
  readonly warmingCapApplied: boolean;
}
