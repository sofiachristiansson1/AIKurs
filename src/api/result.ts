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
  | { readonly kind: 'storageUnavailable' };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
