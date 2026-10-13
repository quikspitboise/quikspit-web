import 'server-only';

import { CONTENT_CACHE_TAG } from './content-api';
import { refreshPublicCache } from './public-cache';

export type CacheRefreshResult = {
  refreshed: boolean;
  paths: string[];
};

/**
 * Expire published content after a publish or unpublish. The tag covers the
 * shared content fetch; the paths cover pages rendered from it. Site and
 * catalog changes reach the nav, footer, metadata, and sitemap, so the whole
 * layout is refreshed for them.
 */
export function refreshPublishedContent(key: string, affectedPaths: string[]): CacheRefreshResult {
  const paths = Array.from(new Set(affectedPaths.filter((path) => path.startsWith('/'))));
  try {
    // Admins expect to see the published change on their next visit.
    refreshPublicCache({
      tags: [CONTENT_CACHE_TAG],
      // Page publication and noIndex changes also change sitemap membership.
      paths: [...paths, '/sitemap.xml'],
      layoutPaths: key.startsWith('page:') ? [] : ['/'],
    });
    return { refreshed: true, paths };
  } catch (error) {
    console.error('Failed to refresh published content cache', { key, error });
    return { refreshed: false, paths };
  }
}
