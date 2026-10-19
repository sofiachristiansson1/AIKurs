import { TEXTS } from '../texts';

/** Open-Meteo data is licensed CC BY 4.0, which requires naming the source. */
export function Attribution() {
  return (
    <p className="attribution">
      {TEXTS.attribution}{' '}
      <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
        Open-Meteo.com
      </a>{' '}
      (
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
        CC BY 4.0
      </a>
      )
    </p>
  );
}
