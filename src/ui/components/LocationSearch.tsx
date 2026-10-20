import { useId, useState, type FormEvent } from 'react';
import { MAX_QUERY_LENGTH } from '../../api/geocoding';
import type { Location } from '../../domain/types';
import { formatLocation } from '../format';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { TEXTS } from '../texts';
import { ErrorMessage } from './ErrorMessage';

interface LocationSearchProps {
  readonly selected: Location | undefined;
  readonly onSelect: (location: Location) => void;
}

export function LocationSearch({ selected, onSelect }: LocationSearchProps) {
  const { state, search, choose } = useLocationSearch(onSelect);
  const [query, setQuery] = useState('');
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(query);
  }

  return (
    <section className="card" aria-labelledby={`${inputId}-heading`}>
      <h2 id={`${inputId}-heading`}>Ort</h2>
      {selected !== undefined && (
        <p className="muted">
          Vald ort: <strong>{formatLocation(selected)}</strong>
        </p>
      )}
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor={inputId}>Sök ort i Sverige</label>
        <div className="search-row">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit" disabled={state.status === 'searching'}>
            Sök
          </button>
        </div>
      </form>
      {state.status === 'searching' && <p role="status">{TEXTS.searching}</p>}
      {state.status === 'error' && <ErrorMessage error={state.error} query={state.query} />}
      {state.status === 'choose' && (
        <div className="matches">
          <p>Flera orter matchar "{state.query}". Välj en:</p>
          <ul>
            {state.matches.map((match) => (
              <li key={match.id}>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    choose(match);
                  }}
                >
                  {formatLocation(match)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
