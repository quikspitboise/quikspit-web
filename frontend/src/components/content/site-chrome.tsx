'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export const PREVIEW_PATH_PREFIX = '/admin/preview'

/**
 * The published header and footer. Admin preview renders its own from the
 * draft site content, so they are left out there.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith(PREVIEW_PATH_PREFIX)) return null
  return <>{children}</>
}
