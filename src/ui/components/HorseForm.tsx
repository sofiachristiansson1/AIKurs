import { useId, useState } from 'react';
import { BREED_TYPES, HOUSINGS } from '../../domain/types';
import { AGE_INPUT_RANGE, isValidAge, type HorseDraft } from '../hooks/useHorseProfile';
import { BREED_LABELS, HOUSING_LABELS } from '../texts';

interface HorseFormProps {
  readonly draft: HorseDraft;
  readonly onChange: (draft: HorseDraft) => void;
}

function parseAge(text: string): number | undefined {
  return text.trim() === '' ? undefined : Number(text);
}

export function HorseForm({ draft, onChange }: HorseFormProps) {
  const id = useId();
  const [ageText, setAgeText] = useState(draft.ageYears?.toString() ?? '');
  const ageInvalid = ageText.trim() !== '' && !isValidAge(parseAge(ageText));

  return (
    <section className="card" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>Hästen</h2>
      <form
        className="horse-form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <fieldset>
          <legend>Klippt</legend>
          {[false, true].map((clipped) => (
            <label key={String(clipped)} className="choice">
              <input
                type="radio"
                name={`${id}-clipped`}
                checked={draft.clipped === clipped}
                onChange={() => {
                  onChange({ ...draft, clipped });
                }}
              />
              {clipped ? 'Ja' : 'Nej'}
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor={`${id}-breed`}>Hästtyp</label>
          <select
            id={`${id}-breed`}
            value={draft.breedType}
            onChange={(event) => {
              const breedType = BREED_TYPES.find((breed) => breed === event.target.value);
              if (breedType !== undefined) {
                onChange({ ...draft, breedType });
              }
            }}
          >
            {BREED_TYPES.map((breed) => (
              <option key={breed} value={breed}>
                {BREED_LABELS[breed]}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend>Var står hästen?</legend>
          {HOUSINGS.map((housing) => (
            <label key={housing} className="choice">
              <input
                type="radio"
                name={`${id}-housing`}
                checked={draft.housing === housing}
                onChange={() => {
                  onChange({ ...draft, housing });
                }}
              />
              {HOUSING_LABELS[housing]}
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor={`${id}-age`}>Ålder (år)</label>
          <input
            id={`${id}-age`}
            type="number"
            inputMode="numeric"
            min={AGE_INPUT_RANGE.min}
            max={AGE_INPUT_RANGE.max}
            step={1}
            value={ageText}
            aria-invalid={ageInvalid}
            aria-describedby={ageInvalid ? `${id}-age-error` : undefined}
            onChange={(event) => {
              setAgeText(event.target.value);
              onChange({ ...draft, ageYears: parseAge(event.target.value) });
            }}
          />
          {ageInvalid && (
            <p id={`${id}-age-error`} className="field-error">
              Ange åldern i hela år, mellan {AGE_INPUT_RANGE.min} och {AGE_INPUT_RANGE.max}.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
