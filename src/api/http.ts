import { err, ok, rejectResponse, reportUnexpected, type ApiError, type Result } from './result';
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
  const request = createRequestSignal(options.timeoutMs ?? REQUEST_TIMEOUT_MS, options.signal);
  try {
    const response = await fetch(url, { signal: request.signal });
    const body = await readJsonBody(response);
    if (!response.ok) {
      const reason = readReason(body);
      // The reason is in English and meant for developers, so it is logged, not shown.
      console.warn(`Täckesguiden: ${url.host} answered ${String(response.status)}`, reason);
      return err({ kind: 'serviceError', status: response.status, reason });
    }
    return body === undefined
      ? err(rejectResponse(`${url.host} sent a body that is not JSON`))
      : ok(body);
  } catch (error) {
    return err(classifyFailure(error, request.hasTimedOut(), options.signal));
  } finally {
    request.dispose();
  }
}

interface RequestSignal {
  readonly signal: AbortSignal;
  readonly hasTimedOut: () => boolean;
  /** Stops the timer and stops listening to the caller's signal. */
  readonly dispose: () => void;
}

/**
 * Combines the caller's signal with a timeout. Built from AbortController and setTimeout
 * because AbortSignal.any and AbortSignal.timeout are missing in older browsers, such as
 * Safari before 17.4, where they would make every request fail.
 */
function createRequestSignal(timeoutMs: number, callerSignal?: AbortSignal): RequestSignal {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => {
    controller.abort();
  };
  if (callerSignal?.aborted === true) {
    controller.abort();
  } else {
    callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
  }
  return {
    signal: controller.signal,
    hasTimedOut: () => timedOut,
    dispose: () => {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', abortFromCaller);
    },
  };
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

function classifyFailure(error: unknown, timedOut: boolean, callerSignal?: AbortSignal): ApiError {
  if (callerSignal?.aborted === true) {
    return { kind: 'aborted' };
  }
  if (timedOut) {
    return { kind: 'network', timedOut: true };
  }
  // fetch rejects with a TypeError when the network fails. Anything else is a bug.
  if (error instanceof TypeError) {
    return { kind: 'network', timedOut: false };
  }
  return reportUnexpected(error);
}
