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

export const BREED_TYPES = ['coldbloodOrPony', 'warmblood', 'thoroughbredOrArab'] as const;

export type BreedType = (typeof BREED_TYPES)[number];

export const HOUSINGS = ['outdoor', 'stable'] as const;

export type Housing = (typeof HOUSINGS)[number];

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

export interface Location {
  readonly id: number;
  readonly name: string;
  /** County or similar, used to tell places with the same name apart. */
  readonly region?: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
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

/** Conditions right now. Precipitation is left out: Open-Meteo sums it over 15 minutes here. */
export interface CurrentWeather {
  readonly localTime: LocalDateTime;
  readonly temperatureC: number;
  readonly apparentTemperatureC: number;
  readonly windSpeedMs: number;
}

export interface Forecast {
  /** Current local time at the location, from the weather service rather than the device clock. */
  readonly nowLocal: LocalDateTime;
  readonly current: CurrentWeather;
  readonly hours: readonly WeatherHour[];
}
