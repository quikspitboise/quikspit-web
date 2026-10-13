/**
 * Client-side checks that mirror backend/src/content/content.validation.ts,
 * so admins see problems next to the field instead of after saving. The
 * backend still validates everything.
 */
import type { ContentKind } from './types'

export function isSafeContentLink(value: string): boolean {
  if (!value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  if (/^#[a-zA-Z][\w-]*$/.test(value)) return true
  if (/^tel:\+[1-9]\d{7,14}$/.test(value)) return true
  if (/^mailto:[^@?:]+@[^@?:]+\.[^@?:]+$/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

export const LINK_HINT = 'A page on this site like /pricing, a section like #faq, a full https:// address, mailto:, or tel:+1…'

export function linkError(value: string): string | null {
  if (!value) return 'Add a link.'
  if (value.startsWith('http://')) return 'Use https:// for outside links.'
  return isSafeContentLink(value) ? null : 'This link is not allowed. ' + LINK_HINT
}

export function phoneError(value: string): string | null {
  return /^\+[1-9]\d{7,14}$/.test(value) ? null : 'Use international format with no spaces, like +12085551234.'
}

export function emailError(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Enter a valid email address.'
}

export function idError(value: string): string | null {
  return /^[a-z][a-z0-9-]{0,79}$/.test(value) ? null : 'Use up to 80 lowercase letters, numbers, and dashes, starting with a letter.'
}

/** Bounds shared with the backend JSON checks and content DTOs. */
export function contentProblems(kind: ContentKind, value: unknown): string[] {
  const problems: string[] = []
  const problem = (path: string, message: string) => problems.push(`${path || 'Content'}: ${message}`)
  const object = (item: unknown): Record<string, unknown> =>
    item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : {}
  const textLength = (text: string) => Array.from(text).length
  // class-validator's MaxLength also excludes Unicode presentation selectors.
  const dtoLength = (text: string) => textLength(text) - (text.match(/[^\uFE0F\uFE0E][\uFE0F\uFE0E]/gu)?.length ?? 0)

  const walk = (item: unknown, path = '', depth = 0, key = ''): void => {
    if (depth > 10) { problem(path, 'use no more than 10 levels of nesting.'); return }
    if (/(?:href|url|src)$/i.test(key) && (typeof item !== 'string' || item.length > 2048 || !isSafeContentLink(item))) {
      problem(path, 'add an allowed link of up to 2048 characters.')
    }
    if (typeof item === 'string') {
      if (textLength(item) > 10000) problem(path, 'use up to 10000 characters.')
    } else if (Array.isArray(item)) {
      if (item.length > 100) problem(path, 'use up to 100 items.')
      item.slice(0, 100).forEach((child, index) => walk(child, `${path}[${index + 1}]`, depth + 1, key))
    } else if (item && typeof item === 'object') {
      const entries = Object.entries(item)
      if (entries.length > 100) problem(path, 'use up to 100 fields.')
      for (const [childKey, child] of entries.slice(0, 100)) {
        const childPath = path ? `${path}.${childKey}` : childKey
        if (!/^[a-zA-Z][\w-]{0,79}$/.test(childKey) || ['__proto__', 'prototype', 'constructor'].includes(childKey)) {
          problem(childPath, 'use a valid field name.')
        }
        // Free-form section fields and site copy each have their own depth budget.
        const freeFormRoot = (kind === 'page' && /^sections\[\d+\]$/.test(path) && childKey === 'fields') ||
          (kind === 'site' && !path && childKey === 'copy')
        walk(child, childPath, freeFormRoot ? 0 : depth + 1, childKey)
      }
    } else if (item !== null && typeof item !== 'boolean' && !(typeof item === 'number' && Number.isFinite(item))) {
      problem(path, 'use a valid JSON value.')
    }
  }
  walk(value)
  try {
    if (new TextEncoder().encode(JSON.stringify(value)).length > 80000) problem('', 'the document must fit within 80000 bytes.')
  } catch {
    problem('', 'use a valid JSON document.')
  }

  const textBounds = (item: unknown, limits: Record<string, number>, path: string) => {
    const record = object(item)
    for (const [key, max] of Object.entries(limits)) {
      if (typeof record[key] === 'string' && dtoLength(record[key]) > max) problem(`${path}.${key}`, `use up to ${max} characters.`)
    }
  }
  const list = (item: unknown, path: string, max: number, min = 0, ids = false): Record<string, unknown>[] => {
    if (!Array.isArray(item)) { problem(path, 'add a list.'); return [] }
    if (item.length < min || item.length > max) problem(path, `use ${min ? `${min} to ` : 'up to '}${max} items.`)
    const seen = new Set<string>()
    const records = item.map(object)
    if (ids) records.forEach((record, index) => {
      const id = typeof record.id === 'string' ? record.id : ''
      const error = idError(id)
      if (error) problem(`${path}[${index + 1}].id`, error)
      if (seen.has(id)) problem(`${path}[${index + 1}].id`, `duplicate ID "${id}".`)
      seen.add(id)
    })
    return records
  }
  const doc = object(value)
  if (doc.schemaVersion !== 1) problem('schemaVersion', 'use version 1.')
  if (kind !== 'catalog') textBounds(doc.metadata, { title: 200, description: 1000, socialTitle: 200, socialDescription: 1000, socialImageUrl: 2048 }, 'metadata')
  if (kind === 'page') {
    textBounds(doc, { title: 160 }, 'page')
    list(doc.sections, 'sections', 50, 1, true)
  } else if (kind === 'site') {
    textBounds(doc.business, { name: 160, phoneDisplay: 80, email: 254, serviceArea: 500, hours: 500, locationNote: 1000 }, 'business')
    const linkBounds = { label: 160, href: 2048 }
    textBounds(doc.bookingLink, linkBounds, 'bookingLink')
    for (const key of ['navigation', 'footerLinks', 'socialLinks']) {
      list(doc[key], key, 20).forEach((link, index) => textBounds(link, linkBounds, `${key}[${index + 1}]`))
    }
  } else {
    if (doc.currency !== 'USD') problem('currency', 'use USD.')
    const priceBounds = (item: Record<string, unknown>, path: string) => {
      for (const key of ['basePriceCents', 'priceCents', 'surchargeCents']) {
        if (key in item && (!Number.isInteger(item[key]) || Number(item[key]) < 0 || Number(item[key]) > 100000000)) {
          problem(`${path}.${key}`, 'use whole cents from 0 to 100000000.')
        }
      }
      if (item.duration) {
        const duration = object(item.duration)
        for (const key of ['minMinutes', 'maxMinutes']) {
          if (!Number.isInteger(duration[key]) || Number(duration[key]) < 0 || Number(duration[key]) > 10080) {
            problem(`${path}.duration.${key}`, 'use whole minutes from 0 to 10080.')
          }
        }
      }
    }
    list(doc.categories, 'categories', 20, 1, true).forEach((category, index) => {
      const path = `categories[${index + 1}]`
      textBounds(category, { label: 160, blurb: 2000 }, path)
      list(category.packages, `${path}.packages`, 30, 1, true).forEach((pkg, packageIndex) => {
        const packagePath = `${path}.packages[${packageIndex + 1}]`
        textBounds(pkg, { name: 160, tagline: 500, description: 2000 }, packagePath)
        priceBounds(pkg, packagePath)
        list(pkg.features, `${packagePath}.features`, 50)
        if (Array.isArray(pkg.features)) pkg.features.forEach((feature, featureIndex) => {
          if (typeof feature === 'string' && dtoLength(feature) > 1000) problem(`${packagePath}.features[${featureIndex + 1}]`, 'use up to 1000 characters.')
        })
      })
    })
    for (const [key, max, min] of [['vehicleSizes', 20, 1], ['addons', 50, 0], ['ceramicServices', 30, 0]] as const) {
      list(doc[key], key, max, min, true).forEach((item, index) => {
        const path = `${key}[${index + 1}]`
        textBounds(item, { label: 160, name: 160, description: 2000, note: 1000, includedCorrectionId: 80 }, path)
        priceBounds(item, path)
      })
    }
  }
  return [...new Set(problems)]
}

/** Turn a name into a permanent catalog id that is unique among `taken`. */
export function makeId(name: string, taken: string[]): string {
  const base = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[^a-z]+|-+$/g, '') || 'item').slice(0, 70)
  let id = base
  for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`
  return id
}

type ValidationNode = {
  property?: string
  constraints?: Record<string, string>
  children?: ValidationNode[]
}

function flatten(nodes: ValidationNode[], path: string[] = []): string[] {
  return nodes.flatMap((node) => {
    const here = node.property ? [...path, node.property] : path
    const own = Object.values(node.constraints ?? {}).map((message) => `${here.join('.')}: ${message}`)
    return [...own, ...flatten(node.children ?? [], here)]
  })
}

/** Readable message from a backend error body (Nest or class-validator shaped). */
export function describeApiError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const { message, errors, error } = body as { message?: unknown; errors?: unknown; error?: unknown }
  if (Array.isArray(errors) && errors.length) {
    const details = flatten(errors as ValidationNode[]).slice(0, 4)
    if (details.length) return `${typeof message === 'string' ? message : 'Invalid content'}: ${details.join('; ')}`
  }
  if (Array.isArray(message)) return message.filter((item) => typeof item === 'string').join(' ') || fallback
  if (typeof message === 'string' && message.trim()) return message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}
