// Shared fetch timeout helper: guarantees a hung backend aborts instead of
// hanging page renders. Prefers AbortSignal.timeout, falls back to
// AbortController for older runtimes.

export const DEFAULT_FETCH_TIMEOUT_MS = 8000;

export function createTimeoutSignal(timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}
