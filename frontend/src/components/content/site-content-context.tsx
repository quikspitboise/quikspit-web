'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SiteContent } from '@/lib/content/types'

const SiteContentContext = createContext<SiteContent | null>(null)
const PreviewBaseContext = createContext<string | undefined>(undefined)

/**
 * Shared business details for client components. The root layout provides
 * published content; admin preview nests a provider with the draft.
 */
export function SiteContentProvider({ site, previewBase, children }: { site: SiteContent; previewBase?: string; children: ReactNode }) {
  return (
    <SiteContentContext.Provider value={site}>
      <PreviewBaseContext.Provider value={previewBase}>{children}</PreviewBaseContext.Provider>
    </SiteContentContext.Provider>
  )
}

export function usePreviewBase(): string | undefined {
  return useContext(PreviewBaseContext)
}

export function useSiteContent(): SiteContent {
  const site = useContext(SiteContentContext)
  if (!site) throw new Error('useSiteContent must be used inside SiteContentProvider')
  return site
}
