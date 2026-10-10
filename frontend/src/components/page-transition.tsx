'use client'

import { usePathname } from 'next/navigation'
import { PropsWithChildren, useState } from 'react'

/**
 * Fades the page in on client-side navigation. The first load is left
 * alone so server-rendered content paints immediately; headings carry their
 * own entrance.
 */
export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const [route, setRoute] = useState({ pathname, navigated: false })

  // Adjusting state during render (not in an effect) so the class lands on
  // the same render as the new page, with no flash of unanimated content.
  if (route.pathname !== pathname) {
    setRoute({ pathname, navigated: true })
  }

  return (
    <div key={pathname} className={route.navigated ? 'page-enter' : undefined}>
      {children}
    </div>
  )
}

export default PageTransition
