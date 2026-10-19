import { TEXTS } from '../texts';

export function Disclaimer() {
  return (
    <aside className="disclaimer" aria-label="Viktigt att veta">
      <p>{TEXTS.disclaimer}</p>
    </aside>
  );
}
