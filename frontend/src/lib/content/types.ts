/**
 * Frontend shapes for the site content API. The backend DTOs in
 * backend/src/content/dto/content.dto.ts are the source of truth; see
 * docs/SITE_CONTENT.md for the contract.
 */

export type ContentKind = 'site' | 'catalog' | 'page'

export const SECTION_TYPES = [
  'hero',
  'rich-text',
  'services',
  'steps',
  'reviews',
  'social',
  'cta',
  'faq',
  'gallery',
  'contact',
  'booking',
  'owner',
] as const

export type SectionType = (typeof SECTION_TYPES)[number]

export type ContentLink = { label: string; href: string }

export type ContentMetadata = {
  title: string
  description: string
  socialTitle?: string
  socialDescription?: string
  socialImageUrl?: string
  noIndex?: boolean
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }

export type PageSection = {
  id: string
  type: SectionType
  enabled: boolean
  fields: Record<string, unknown>
}

export type PageContent = {
  schemaVersion: 1
  title: string
  metadata: ContentMetadata
  sections: PageSection[]
}

export type BusinessDetails = {
  name: string
  phone: string
  phoneDisplay: string
  email: string
  serviceArea: string
  hours: string
  locationNote: string
}

export type SiteContent = {
  schemaVersion: 1
  business: BusinessDetails
  navigation: ContentLink[]
  footerLinks: ContentLink[]
  socialLinks: ContentLink[]
  bookingLink: ContentLink
  metadata: ContentMetadata
  copy: Record<string, unknown>
}

export type Duration = { minMinutes: number; maxMinutes: number }

export type CatalogPackage = {
  id: string
  name: string
  tagline: string
  description: string
  basePriceCents: number
  features: string[]
  enabled: boolean
  highlight: boolean
  bestValue: boolean
  ceramicEligible: boolean
  duration: Duration
}

export type CatalogCategory = {
  id: string
  label: string
  blurb: string
  enabled: boolean
  calEventSlug: string
  packages: CatalogPackage[]
}

export type VehicleSize = {
  id: string
  label: string
  surchargeCents: number
  enabled: boolean
}

export type CatalogAddon = {
  id: string
  name: string
  description: string
  priceCents: number
  enabled: boolean
}

export type CeramicService = CatalogAddon & {
  kind: 'coating' | 'correction'
  includedCorrectionId?: string
  note?: string
  duration: Duration
}

export type CatalogContent = {
  schemaVersion: 1
  currency: 'USD'
  calUsername: string
  categories: CatalogCategory[]
  vehicleSizes: VehicleSize[]
  addons: CatalogAddon[]
  ceramicServices: CeramicService[]
}

export type ContentValue = SiteContent | CatalogContent | PageContent

export type PublicDocument<T extends ContentValue = ContentValue> = {
  key: string
  kind: ContentKind
  revisionId: string | null
  publishedAt: string | null
  value: T
}

export type AdminDocument<T extends ContentValue = ContentValue> = {
  key: string
  kind: ContentKind
  draft: T
  version: number
  published: T | null
  publishedRevisionId: string | null
  publishedAt: string | null
  updatedByUserId: string | null
  updatedAt: string
}

export type AdminDocumentSummary = Omit<AdminDocument, 'draft' | 'published'> & {
  title: string
  hasUnpublishedChanges: boolean
}

export type ContentRevisionSummary = {
  id: string
  documentKey: string
  version: number
  action: 'publish' | 'unpublish'
  createdByUserId: string | null
  createdAt: string
}

export type ContentRevision<T extends ContentValue = ContentValue> = ContentRevisionSummary & {
  value: T
}

/** Everything a page renderer needs, whether published or a private draft. */
export type ContentSnapshot = {
  site: SiteContent
  catalog: CatalogContent
  pages: Record<string, PageContent>
  /** Published catalog revision, sent with quotes to detect stale prices. */
  catalogRevisionId: string | null
  source: 'api' | 'fallback' | 'draft'
}

export function pagePath(slug: string): string {
  return slug === 'home' ? '/' : `/${slug}`
}

export function pageKey(slug: string): string {
  return `page:${slug}`
}

export function slugFromKey(key: string): string | null {
  return key.startsWith('page:') ? key.slice(5) : null
}

/**
 * Inside admin preview, keep site-relative links within the preview so the
 * admin keeps seeing drafts. Other links, and links outside preview, pass through.
 */
export function toPreviewHref(href: string, previewBase?: string): string {
  if (!previewBase || !href.startsWith('/') || href.startsWith('//')) return href
  const suffixIndex = href.search(/[?#]/)
  const path = suffixIndex === -1 ? href : href.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : href.slice(suffixIndex)
  // These are resources or application routes, rather than content pages.
  if (/^\/(?:api|admin|_next|assets|static|images|videos|uploads|media|fonts|icons)(?:\/|$)/.test(path)
    || /\.[^/]+$/.test(path)) return href
  const slug = path === '/' ? 'home' : path.slice(1)
  return `${previewBase.replace(/\/$/, '')}/${slug}${suffix}`
}
