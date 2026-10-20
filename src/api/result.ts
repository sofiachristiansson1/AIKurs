export type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

/** Everything that can go wrong when talking to the outside world. The UI words these in Swedish. */
export type ApiError =
  | { readonly kind: 'emptyQuery' }
  | { readonly kind: 'locationNotFound' }
  | { readonly kind: 'network'; readonly timedOut: boolean }
  /** The caller cancelled the request, e.g. because a newer search replaced it. Not shown to users. */
  | { readonly kind: 'aborted' }
  | { readonly kind: 'serviceError'; readonly status: number; readonly reason: string | undefined }
  | { readonly kind: 'invalidResponse' }
  | { readonly kind: 'storageUnavailable' }
  /** A bug in the app rather than a problem with the outside world. Logged for developers. */
  | { readonly kind: 'unexpected' };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Logs an error nobody planned for, so it is not lost, and wraps it as an ApiError. */
export function reportUnexpected(cause: unknown): ApiError {
  console.error('Täckesguiden: unexpected error', cause);
  return { kind: 'unexpected' };
}

/**
 * Turns a rejected promise into an `unexpected` error. Use it where the UI starts a request,
 * so a bug shows a message instead of leaving the page loading forever.
 */
export function catchUnexpected<T>(
  promise: Promise<Result<T, ApiError>>,
): Promise<Result<T, ApiError>> {
  return promise.catch((cause: unknown) => err(reportUnexpected(cause)));
}
