import { buildBackendApiUrl } from '../backend-api'
import { createTimeoutSignal } from '../fetch-with-timeout'
import type { CatalogSelection, QuoteLineItem } from './catalog'
import type { Duration } from './types'

export type ServerQuote = {
  currency: 'USD'
  catalogRevisionId: string
  lineItems: QuoteLineItem[]
  totalCents: number
  duration: Duration
  calLink: string
}

export type QuoteResult =
  | { status: 'ok'; quote: ServerQuote }
  /** Prices were published after this page loaded. */
  | { status: 'stale' }
  /** The selection is no longer offered, or the backend could not be reached. */
  | { status: 'rejected' | 'unavailable' }

/**
 * Ask the backend to price a selection from published content. The browser
 * calls the backend directly so its per-visitor rate limit applies.
 */
export async function requestQuote(selection: CatalogSelection, catalogRevisionId: string | null): Promise<QuoteResult> {
  try {
    const response = await fetch(buildBackendApiUrl('/content/quote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      signal: createTimeoutSignal(),
      body: JSON.stringify({
        categoryId: selection.categoryId,
        packageId: selection.packageId,
        vehicleSizeId: selection.vehicleSizeId,
        addonIds: selection.addonIds,
        ...(selection.coatingId ? { coatingId: selection.coatingId } : {}),
        ...(selection.correctionId ? { correctionId: selection.correctionId } : {}),
        ...(catalogRevisionId ? { catalogRevisionId } : {}),
      }),
    })
    if (response.status === 409) return { status: 'stale' }
    if (response.status === 400) return { status: 'rejected' }
    if (!response.ok) return { status: 'unavailable' }
    return { status: 'ok', quote: (await response.json()) as ServerQuote }
  } catch {
    return { status: 'unavailable' }
  }
}
