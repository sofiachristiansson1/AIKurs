const oneDecimal = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 });

export function formatTemperature(temperatureC: number): string {
  return `${oneDecimal.format(temperatureC)} °C`;
}

export function formatWindSpeed(windSpeedMs: number): string {
  return `${oneDecimal.format(windSpeedMs)} m/s`;
}

export function formatPrecipitation(precipitationMm: number): string {
  return `${oneDecimal.format(precipitationMm)} mm`;
}

export function formatSteps(steps: number): string {
  return `${steps > 0 ? '+' : '−'}${Math.abs(steps)} steg`;
}

/** 'YYYY-MM-DDTHH:mm' -> 'kl. HH:mm' */
export function formatClockTime(localTime: string): string {
  return `kl. ${localTime.slice(11, 16)}`;
}
