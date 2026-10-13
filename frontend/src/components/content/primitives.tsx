import type { ReactNode } from 'react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { toPreviewHref, type ContentLink } from '@/lib/content/types'

/** Section anchor ids come from content, so keep the fixed nav clear of them. */
export const SECTION_SCROLL_MARGIN = 'scroll-mt-[calc(var(--nav-total-height)+1rem)]'

export function SectionHeading({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="lg:col-span-4">
      <h2 className="font-display text-3xl sm:text-4xl text-white uppercase text-balance">{children}</h2>
      {aside && <div className="mt-4 max-w-sm text-neutral-400 text-pretty">{aside}</div>}
    </div>
  )
}

export function PriceRow({
  name,
  description,
  price,
  children,
}: {
  name: string
  description: string
  price: string
  children?: ReactNode
}) {
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-b border-white/10 py-5">
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <span className="font-display text-xl sm:text-2xl text-white tabular text-right">{price}</span>
      {description && <p className="col-span-2 text-neutral-400 text-pretty max-w-xl">{description}</p>}
      {children && <div className="col-span-2">{children}</div>}
    </li>
  )
}

export function ContentButton({
  link,
  variant = 'primary',
  size = 'lg',
  className,
  previewBase,
}: {
  link: ContentLink | null
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  className?: string
  previewBase?: string
}) {
  if (!link) return null
  return (
    <MagneticButton href={toPreviewHref(link.href, previewBase)} variant={variant} size={size} className={className}>
      {link.label}
    </MagneticButton>
  )
}

/** JSON-LD with `<` escaped so content can never close the script element. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <div className={className}>
      {items.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
