import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';
import { buildBackendApiUrl } from '../backend-api';
import { createTimeoutSignal } from '../fetch-with-timeout';
import { FALLBACK_CONTENT } from '../content/fallback-content';
import {
  pageKey,
  slugFromKey,
  type AdminDocument,
  type AdminDocumentSummary,
  type CatalogContent,
  type ContentSnapshot,
  type PageContent,
  type PublicDocument,
  type SiteContent,
} from '../content/types';
import { getAdminApiAuth } from './admin-auth';

/** Every published read carries this tag; publishing expires it. */
export const CONTENT_CACHE_TAG = 'site-content';
/** Upper bound on staleness if a publish-time refresh is missed. */
export const CONTENT_REVALIDATE_SECONDS = 300;

function snapshotFrom(
  documents: { key: string; value: unknown; revisionId?: string | null }[],
  source: ContentSnapshot['source'],
): ContentSnapshot {
  const byKey = new Map(documents.map((document) => [document.key, document]));
  const fallback = new Map(FALLBACK_CONTENT.map((document) => [document.key, document]));
  const pages: Record<string, PageContent> = {};
  for (const document of documents) {
    const slug = slugFromKey(document.key);
    if (slug !== null) {
      pages[slug] = document.value as PageContent;
    }
  }

  return {
    // Site and catalog always exist once migrated; the fallback only covers
    // a backend that has not run the content migration yet.
    site: (byKey.get('site') ?? fallback.get('site')!).value as SiteContent,
    catalog: (byKey.get('catalog') ?? fallback.get('catalog')!).value as CatalogContent,
    pages,
    catalogRevisionId: byKey.get('catalog')?.revisionId ?? null,
    source,
  };
}

const fallbackSnapshot = () => snapshotFrom(FALLBACK_CONTENT, 'fallback');

/**
 * All published content from one consistent backend snapshot. Cached across
 * requests under CONTENT_CACHE_TAG and deduplicated within a render.
 */
export const getPublishedContent = cache(async (): Promise<ContentSnapshot> => {
  try {
    const response = await fetch(buildBackendApiUrl('/content'), {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] },
      signal: createTimeoutSignal(),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch content: ${response.status}`);

    const data = (await response.json()) as { documents?: PublicDocument[] };
    if (!Array.isArray(data?.documents)) throw new Error('Invalid content payload');
    return snapshotFrom(data.documents, 'api');
  } catch (error) {
    console.error('Falling back to bundled site content', error);
    return fallbackSnapshot();
  }
});

/** The published page, or a 404 when it is not published. */
export async function getPublishedPage(slug: string) {
  const content = await getPublishedContent();
  const page = content.pages[slug];
  if (!page) notFound();
  return { content, page };
}

async function adminFetch(path: string): Promise<Response> {
  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) throw new Error('Admin session is required');

  return fetch(buildBackendApiUrl(path), {
    cache: 'no-store',
    signal: createTimeoutSignal(),
    headers: {
      Authorization: `Bearer ${adminAuth.token}`,
      Accept: 'application/json',
    },
  });
}

export async function fetchAdminContentSummaries(): Promise<AdminDocumentSummary[]> {
  const response = await adminFetch('/content/admin/documents');
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch content documents (${response.status}): ${body.slice(0, 300)}`);
  }
  const data = (await response.json()) as { documents: AdminDocumentSummary[] };
  return data.documents;
}

export async function fetchAdminDocument<T extends AdminDocument>(key: string): Promise<T | null> {
  const response = await adminFetch(`/content/admin/documents/${encodeURIComponent(key)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch content document ${key} (${response.status}): ${body.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

/** Saved drafts of the shared documents and one page, for admin preview. */
export async function getDraftContent(slug: string) {
  const [site, catalog, page] = await Promise.all([
    fetchAdminDocument<AdminDocument<SiteContent>>('site'),
    fetchAdminDocument<AdminDocument<CatalogContent>>('catalog'),
    fetchAdminDocument<AdminDocument<PageContent>>(pageKey(slug)),
  ]);
  if (!site || !catalog || !page) return null;

  const content: ContentSnapshot = {
    site: site.draft,
    catalog: catalog.draft,
    pages: { [slug]: page.draft },
    catalogRevisionId: catalog.publishedRevisionId,
    source: 'draft',
  };
  return { content, page: page.draft };
}
