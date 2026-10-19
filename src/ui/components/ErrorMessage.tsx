import type { ApiError } from '../../api/result';
import { errorMessage, TEXTS } from '../texts';

interface ErrorMessageProps {
  readonly error: ApiError;
  readonly query?: string;
  readonly onRetry?: () => void;
}

/** Shows an error in Swedish. Cancelled requests show nothing. */
export function ErrorMessage({ error, query, onRetry }: ErrorMessageProps) {
  const message = errorMessage(error, query);
  if (message === undefined) {
    return null;
  }
  return (
    <div className="error" role="alert">
      <p>{message}</p>
      {onRetry !== undefined && (
        <button type="button" className="button-secondary" onClick={onRetry}>
          {TEXTS.retry}
        </button>
      )}
    </div>
  );
}
