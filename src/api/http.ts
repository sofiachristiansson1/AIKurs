import { err, ok, reportUnexpected, type ApiError, type Result } from './result';
import { asNonEmptyString, isRecord } from './validation';

export const REQUEST_TIMEOUT_MS = 10_000;

export interface RequestOptions {
  /** Lets the caller cancel, e.g. when a newer search replaces this one. */
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

/** GETs a URL and returns the parsed JSON body, or an ApiError. Never throws. */
export async function getJson(
  url: URL,
  options: RequestOptions = {},
): Promise<Result<unknown, ApiError>> {
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const signal =
    options.signal === undefined ? timeoutSignal : AbortSignal.any([options.signal, timeoutSignal]);
  try {
    const response = await fetch(url, { signal });
    const body = await readJsonBody(response);
    if (!response.ok) {
      return err({ kind: 'serviceError', status: response.status, reason: readReason(body) });
    }
    return body === undefined ? err({ kind: 'invalidResponse' }) : ok(body);
  } catch (error) {
    return err(classifyFailure(error, timeoutSignal, options.signal));
  }
}

async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return undefined;
  }
}

/** Open-Meteo explains errors as { "error": true, "reason": "..." }. */
function readReason(body: unknown): string | undefined {
  return isRecord(body) ? asNonEmptyString(body.reason) : undefined;
}

function classifyFailure(
  error: unknown,
  timeoutSignal: AbortSignal,
  callerSignal?: AbortSignal,
): ApiError {
  if (callerSignal?.aborted === true) {
    return { kind: 'aborted' };
  }
  if (timeoutSignal.aborted) {
    return { kind: 'network', timedOut: true };
  }
  // fetch rejects with a TypeError when the network fails. Anything else is a bug.
  if (error instanceof TypeError) {
    return { kind: 'network', timedOut: false };
  }
  return reportUnexpected(error);
}
