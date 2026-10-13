import type { Metadata } from 'next'
import { ContentPage } from '@/components/content/content-page'
import { buildPageMetadata } from '@/lib/content/metadata'
import { getPublishedPage } from '@/lib/server/content-api'

/** Route exports for a page rendered from published content. */
export function contentRoute(slug: string) {
  return {
    async generateMetadata(): Promise<Metadata> {
      const { content, page } = await getPublishedPage(slug)
      return buildPageMetadata(content, slug, page)
    },
    async Page() {
      const { content, page } = await getPublishedPage(slug)
      return <ContentPage content={content} page={page} slug={slug} />
    },
  }
}
