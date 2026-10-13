import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/content/metadata';
import { pagePath } from '@/lib/content/types';
import { getPublishedContent } from '@/lib/server/content-api';

const PRIORITY: Record<string, number> = { home: 1, pricing: 0.9, booking: 0.9 };

/** Published, indexable pages. Publishing a page refreshes this. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublishedContent();
  if (content.site.metadata.noIndex) return [];

  return Object.entries(content.pages)
    .filter(([, page]) => !page.metadata.noIndex)
    .map(([slug]) => ({
      url: slug === 'home' ? SITE_URL : `${SITE_URL}${pagePath(slug)}`,
      lastModified: new Date(),
      changeFrequency: slug === 'gallery' ? 'weekly' : 'monthly',
      priority: PRIORITY[slug] ?? 0.8,
    }));
}
