import { HomeStructuredData } from '@/components/home-structured-data'
import { ContentSection, type RenderContext } from '@/components/content/sections'
import { SiteContentProvider } from '@/components/content/site-content-context'
import { fetchCachedBookingSettings } from '@/lib/server/booking-settings-api'
import { formatCents, surchargeRange } from '@/lib/content/catalog'
import { buildLocalBusinessData } from '@/lib/content/metadata'
import type { ContentSnapshot, PageContent } from '@/lib/content/types'

type ContentPageProps = {
  content: ContentSnapshot
  page: PageContent
  slug: string
  preview?: boolean
}

/**
 * Renders a page as its ordered, enabled sections. Every route and the admin
 * preview share this, so a new page only needs content and a route.
 */
export async function ContentPage({ content, page, slug, preview = false }: ContentPageProps) {
  const { depositAmount } = await fetchCachedBookingSettings()
  const previewBase = preview ? '/admin/preview' : undefined
  const ctx: RenderContext = {
    content,
    slug,
    depositAmount,
    preview,
    previewBase,
    tokens: {
      surchargeRange: surchargeRange(content.catalog),
      depositAmount: formatCents(Math.round(depositAmount * 100)),
    },
  }

  return (
    <SiteContentProvider site={content.site} previewBase={previewBase}>
      {slug === 'home' && <HomeStructuredData baseData={buildLocalBusinessData(content)} />}
      <main id="main-content" className="min-h-screen">
        {page.sections
          .filter((section) => section.enabled)
          .map((section) => (
            <ContentSection key={section.id} section={section} ctx={ctx} />
          ))}
      </main>
    </SiteContentProvider>
  )
}
