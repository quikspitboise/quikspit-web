/**
 * Tolerant readers for the free-form JSON in section `fields` and
 * `site.copy`. Content is plain text: these never interpret markup, and a
 * missing or mistyped field reads as empty so a renderer can skip it.
 */
import type { ContentLink, SiteContent } from './types'

type Fields = Record<string, unknown>

export function readText(fields: Fields | undefined, key: string): string {
  const value = fields?.[key]
  return typeof value === 'string' ? value : ''
}

export function readBool(fields: Fields | undefined, key: string): boolean {
  return fields?.[key] === true
}

export function readTextList(fields: Fields | undefined, key: string): string[] {
  const value = fields?.[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : []
}

export function asLink(value: unknown): ContentLink | null {
  if (!value || typeof value !== 'object') return null
  const { label, href } = value as Partial<ContentLink>
  return typeof label === 'string' && typeof href === 'string' && label.trim() && href.trim() ? { label, href } : null
}

export function readLink(fields: Fields | undefined, key: string): ContentLink | null {
  return asLink(fields?.[key])
}

export function readObjectList(fields: Fields | undefined, key: string): Fields[] {
  const value = fields?.[key]
  return Array.isArray(value)
    ? value.filter((item): item is Fields => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : []
}

/** Read `site.copy` by dotted path, e.g. `reviews.heading`. */
export function siteCopy(site: SiteContent, path: string, fallback = ''): string {
  let value: unknown = site.copy
  for (const part of path.split('.')) {
    value = value && typeof value === 'object' ? (value as Fields)[part] : undefined
  }
  return typeof value === 'string' && value.trim() ? value : fallback
}

export type TokenValues = {
  surchargeRange?: string
  depositAmount?: string
}

/**
 * Substitute the two derived facts that seeded copy refers to. Only these
 * literal tokens are replaced; content is never evaluated as a template.
 */
export function fillTokens(text: string, values: TokenValues): string {
  return text
    .replaceAll('{surchargeRange}', values.surchargeRange ?? '{surchargeRange}')
    .replaceAll('{depositAmount}', values.depositAmount ?? '{depositAmount}')
}

export function isExternalHref(href: string): boolean {
  return /^https:\/\//.test(href)
}
